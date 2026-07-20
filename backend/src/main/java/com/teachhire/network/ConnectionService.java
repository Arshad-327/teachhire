package com.teachhire.network;

import com.teachhire.common.ApiException;
import com.teachhire.network.dto.ConnectionResponse;
import com.teachhire.network.dto.ConnectionSummaryResponse;
import com.teachhire.profile.TeacherProfile;
import com.teachhire.profile.TeacherProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    @Transactional
    public ConnectionResponse sendRequest(Long userId, Long targetTeacherProfileId) {
        TeacherProfile requester = resolveTeacher(userId);

        if (requester.getId().equals(targetTeacherProfileId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot send a connection request to yourself");
        }

        TeacherProfile receiver = teacherProfileRepository.findById(targetTeacherProfileId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found"));

        if (connectionRepository.existsBetween(requester.getId(), receiver.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "A connection already exists between these teachers");
        }

        Connection connection = new Connection(requester, receiver);
        try {
            Connection saved = connectionRepository.save(connection);
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            // race: two concurrent requests between the same pair hit the unique constraint
            throw new ApiException(HttpStatus.CONFLICT, "A connection already exists between these teachers");
        }
    }

    @Transactional
    public ConnectionResponse respond(Long userId, Long connectionId, boolean accept) {
        TeacherProfile teacher = resolveTeacher(userId);

        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Connection not found"));

        if (!connection.getReceiver().getId().equals(teacher.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the receiver of this request can respond to it");
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "This request has already been responded to");
        }

        connection.setStatus(accept ? ConnectionStatus.ACCEPTED : ConnectionStatus.REJECTED);
        connection.setRespondedAt(Instant.now());

        Connection saved = connectionRepository.save(connection);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ConnectionSummaryResponse> listMine(Long userId) {
        TeacherProfile teacher = resolveTeacher(userId);
        return connectionRepository.findByRequesterIdOrReceiverIdOrderByCreatedAtDesc(teacher.getId(), teacher.getId())
                .stream()
                .map(c -> toSummary(c, teacher.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConnectionSummaryResponse> listPending(Long userId) {
        TeacherProfile teacher = resolveTeacher(userId);
        return connectionRepository.findByReceiverIdAndStatusOrderByCreatedAtDesc(teacher.getId(), ConnectionStatus.PENDING)
                .stream()
                .map(c -> toSummary(c, teacher.getId()))
                .toList();
    }

    private TeacherProfile resolveTeacher(Long userId) {
        return teacherProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found for current user"));
    }

    private ConnectionResponse toResponse(Connection c) {
        return new ConnectionResponse(
                c.getId(),
                c.getRequester().getId(),
                c.getRequester().getFullName(),
                c.getReceiver().getId(),
                c.getReceiver().getFullName(),
                c.getStatus(),
                c.getCreatedAt(),
                c.getRespondedAt()
        );
    }

    private ConnectionSummaryResponse toSummary(Connection c, Long viewingTeacherId) {
        boolean viewerIsRequester = c.getRequester().getId().equals(viewingTeacherId);
        TeacherProfile other = viewerIsRequester ? c.getReceiver() : c.getRequester();

        return new ConnectionSummaryResponse(
                c.getId(),
                other.getId(),
                other.getFullName(),
                c.getStatus(),
                c.getCreatedAt(),
                c.getRespondedAt()
        );
    }
}
