package com.teachhire.profile;

import com.teachhire.profile.dto.SubjectSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectRepository subjectRepository;

    @GetMapping("/api/subjects")
    public List<SubjectSummary> listAll() {
        return subjectRepository.findAll().stream()
                .map(subject -> new SubjectSummary(subject.getId(), subject.getName()))
                .toList();
    }
}
