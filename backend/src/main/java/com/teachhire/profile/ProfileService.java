package com.teachhire.profile;

import com.teachhire.auth.User;
import com.teachhire.common.ApiException;
import com.teachhire.profile.dto.InstitutionProfileResponse;
import com.teachhire.profile.dto.SubjectSummary;
import com.teachhire.profile.dto.TeacherProfileResponse;
import com.teachhire.profile.dto.UpdateInstitutionProfileRequest;
import com.teachhire.profile.dto.UpdateTeacherProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final TeacherProfileRepository teacherProfileRepository;
    private final InstitutionProfileRepository institutionProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;

    /**
     * Creates the role-specific profile row for a freshly signed-up user.
     * ADMIN has no dedicated profile table.
     */
    public void createProfileForUser(User user) {
        switch (user.getRole()) {
            case TEACHER -> teacherProfileRepository.save(new TeacherProfile(user));
            case INSTITUTION -> institutionProfileRepository.save(new InstitutionProfile(user));
            case STUDENT -> studentProfileRepository.save(new StudentProfile(user));
            case ADMIN -> {
                // no profile table for admins
            }
        }
    }

    @Transactional(readOnly = true)
    public TeacherProfileResponse getMyTeacherProfile(Long userId) {
        TeacherProfile teacher = teacherProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found for current user"));
        return toTeacherResponse(teacher);
    }

    @Transactional
    public TeacherProfileResponse updateTeacherProfile(Long userId, UpdateTeacherProfileRequest request) {
        TeacherProfile teacher = teacherProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found for current user"));

        Set<Subject> subjects = resolveSubjects(request.subjectIds());

        teacher.setFullName(request.fullName());
        teacher.setHeadline(request.headline());
        teacher.setBio(request.bio());
        teacher.setAvatarUrl(request.avatarUrl());
        teacher.setYearsExperience(request.yearsExperience());
        teacher.setSubjects(subjects);

        TeacherProfile saved = teacherProfileRepository.save(teacher);
        return toTeacherResponse(saved);
    }

    @Transactional
    public InstitutionProfileResponse updateInstitutionProfile(Long userId, UpdateInstitutionProfileRequest request) {
        InstitutionProfile institution = institutionProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution profile not found for current user"));

        institution.setInstitutionName(request.institutionName());
        institution.setAddress(request.address());
        institution.setLogoUrl(request.logoUrl());

        InstitutionProfile saved = institutionProfileRepository.save(institution);
        return toInstitutionResponse(saved);
    }

    private Set<Subject> resolveSubjects(List<Long> subjectIds) {
        Set<Subject> subjects = new HashSet<>();
        for (Long subjectId : subjectIds) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subject not found: " + subjectId));
            subjects.add(subject);
        }
        return subjects;
    }

    private TeacherProfileResponse toTeacherResponse(TeacherProfile t) {
        List<SubjectSummary> subjects = t.getSubjects().stream()
                .map(s -> new SubjectSummary(s.getId(), s.getName()))
                .toList();

        return new TeacherProfileResponse(
                t.getId(),
                t.getFullName(),
                t.getHeadline(),
                t.getBio(),
                t.getAvatarUrl(),
                t.getYearsExperience(),
                t.getRatingAvg(),
                t.getRatingCount(),
                subjects
        );
    }

    private InstitutionProfileResponse toInstitutionResponse(InstitutionProfile i) {
        return new InstitutionProfileResponse(
                i.getId(),
                i.getInstitutionName(),
                i.getType(),
                i.getAddress(),
                i.isVerified(),
                i.getLogoUrl()
        );
    }
}
