package com.teachhire.network;

import com.teachhire.profile.TeacherProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Directional row (requester -> receiver). The unique constraint below only catches an
 * exact same-direction duplicate as a DB-level safety net; the reverse-direction duplicate
 * (B -> A when A -> B already exists) is blocked in {@link ConnectionService} before insert,
 * since a pair-order-independent uniqueness rule can't be expressed as a plain column constraint.
 */
@Entity
@Table(
        name = "connections",
        uniqueConstraints = @UniqueConstraint(name = "uq_requester_receiver", columnNames = {"requester_id", "receiver_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private TeacherProfile requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private TeacherProfile receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConnectionStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) {
            this.status = ConnectionStatus.PENDING;
        }
    }

    public Connection(TeacherProfile requester, TeacherProfile receiver) {
        this.requester = requester;
        this.receiver = receiver;
        this.status = ConnectionStatus.PENDING;
    }
}
