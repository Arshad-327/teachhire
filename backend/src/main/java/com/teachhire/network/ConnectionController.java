package com.teachhire.network;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.network.dto.ConnectionResponse;
import com.teachhire.network.dto.ConnectionSummaryResponse;
import com.teachhire.network.dto.RespondToConnectionRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/api/connections/request/{teacherId}")
    public ResponseEntity<ConnectionResponse> sendRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long teacherId
    ) {
        ConnectionResponse response = connectionService.sendRequest(principal.getId(), teacherId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/connections/{id}/respond")
    public ConnectionResponse respond(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody RespondToConnectionRequest request
    ) {
        return connectionService.respond(principal.getId(), id, request.accept());
    }

    @GetMapping("/api/connections/me")
    public List<ConnectionSummaryResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return connectionService.listMine(principal.getId());
    }

    @GetMapping("/api/connections/me/pending")
    public List<ConnectionSummaryResponse> listPending(@AuthenticationPrincipal UserPrincipal principal) {
        return connectionService.listPending(principal.getId());
    }
}
