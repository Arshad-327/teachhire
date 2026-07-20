package com.teachhire.bulletin;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.bulletin.dto.BulletinResponse;
import com.teachhire.bulletin.dto.CreateBulletinRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BulletinController {

    private final BulletinService bulletinService;

    @PostMapping("/api/bulletins")
    @PreAuthorize("hasRole('INSTITUTION')")
    public ResponseEntity<BulletinResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateBulletinRequest request
    ) {
        BulletinResponse response = bulletinService.createBulletin(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/bulletins")
    public Page<BulletinResponse> search(
            @RequestParam(required = false) BulletinCategory category,
            @RequestParam(required = false) Long institutionId,
            @PageableDefault(size = 20, sort = "postedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return bulletinService.search(category, institutionId, pageable);
    }

    @GetMapping("/api/bulletins/{id}")
    public BulletinResponse getById(@PathVariable Long id) {
        return bulletinService.getById(id);
    }

    @DeleteMapping("/api/bulletins/{id}")
    @PreAuthorize("hasRole('INSTITUTION')")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        bulletinService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/institutions/me/bulletins")
    @PreAuthorize("hasRole('INSTITUTION')")
    public List<BulletinResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return bulletinService.listMine(principal.getId());
    }
}
