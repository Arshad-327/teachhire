package com.teachhire.profile.aggregate;

import com.teachhire.profile.aggregate.dto.TeacherProfileAggregateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TeacherProfileAggregateController {

    private final TeacherProfileAggregateService teacherProfileAggregateService;

    @GetMapping("/api/teachers/{id}/profile")
    public TeacherProfileAggregateResponse getProfile(@PathVariable Long id) {
        return teacherProfileAggregateService.getAggregateProfile(id);
    }
}
