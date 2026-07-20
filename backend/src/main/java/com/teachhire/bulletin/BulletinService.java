package com.teachhire.bulletin;

import com.teachhire.bulletin.dto.BulletinResponse;
import com.teachhire.bulletin.dto.CreateBulletinRequest;
import com.teachhire.common.ApiException;
import com.teachhire.profile.InstitutionProfile;
import com.teachhire.profile.InstitutionProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulletinService {

    private final BulletinRepository bulletinRepository;
    private final InstitutionProfileRepository institutionProfileRepository;

    @Transactional
    public BulletinResponse createBulletin(Long userId, CreateBulletinRequest request) {
        InstitutionProfile institution = resolveInstitution(userId);

        Bulletin bulletin = new Bulletin(institution, request.title(), request.content(), request.category(), request.validUntil());
        Bulletin saved = bulletinRepository.save(bulletin);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<BulletinResponse> search(BulletinCategory category, Long institutionId, Pageable pageable) {
        return bulletinRepository.searchActive(category, institutionId, LocalDate.now(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BulletinResponse getById(Long id) {
        Bulletin bulletin = bulletinRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Bulletin not found"));
        return toResponse(bulletin);
    }

    @Transactional(readOnly = true)
    public List<BulletinResponse> listMine(Long userId) {
        InstitutionProfile institution = resolveInstitution(userId);
        return bulletinRepository.findByInstitutionIdOrderByPostedAtDesc(institution.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void delete(Long userId, Long bulletinId) {
        InstitutionProfile institution = resolveInstitution(userId);

        Bulletin bulletin = bulletinRepository.findById(bulletinId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Bulletin not found"));

        if (!bulletin.getInstitution().getId().equals(institution.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this bulletin");
        }

        bulletinRepository.delete(bulletin);
    }

    private InstitutionProfile resolveInstitution(Long userId) {
        return institutionProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution profile not found for current user"));
    }

    private BulletinResponse toResponse(Bulletin b) {
        return new BulletinResponse(
                b.getId(),
                b.getInstitution().getId(),
                b.getInstitution().getInstitutionName(),
                b.getTitle(),
                b.getContent(),
                b.getCategory(),
                b.getValidUntil(),
                b.getPostedAt()
        );
    }
}
