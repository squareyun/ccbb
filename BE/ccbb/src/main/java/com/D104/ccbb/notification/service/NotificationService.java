package com.D104.ccbb.notification.service;

import com.D104.ccbb.jwt.service.JwtTokenService;
import com.D104.ccbb.notification.domain.Notification;
import com.D104.ccbb.notification.domain.NotificationType;
import com.D104.ccbb.notification.dto.NotificationResponseDto;
import com.D104.ccbb.notification.repo.EmitterRepo;
import com.D104.ccbb.notification.repo.NotificationRepo;
import com.D104.ccbb.user.domain.User;
import com.D104.ccbb.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {


    private final UserRepository userRepository;
    private final JwtTokenService jwtTokenService;
    private final EmitterRepo emitterRepo;
    private final NotificationRepo notificationRepo;
    private Long DEFAULT_TIMEOUT = 60L * 1000L * 60L;

    public SseEmitter subscribe(String authorization, String lastEventId) {
        Integer userId = userRepository.findByEmail(jwtTokenService.getUserEmail((jwtTokenService.extractToken(authorization))))
                .get()
                .getUserId();

        String emitterId = makeTimeIncludeId(userId);
        SseEmitter emitter = emitterRepo.save(emitterId, new SseEmitter(DEFAULT_TIMEOUT));
        emitter.onCompletion(() -> emitterRepo.deleteById(emitterId));
        emitter.onTimeout(() -> emitterRepo.deleteById(emitterId));

        // 503 에러를 방지하기 위한 더미 이벤트 전송
        String eventId = makeTimeIncludeId(userId);
        sendNotification(emitter, eventId, emitterId, "EventStream Created. [userId=" + userId + "]");

        // 클라이언트가 미수신한 Event 목록이 존재할 경우 전송하여 Event 유실을 예방
        if (hasLostData(lastEventId)) {
            sendLostData(lastEventId, userId, emitterId, emitter);
        }

        return emitter;
    }

    /**
     * 유저 아이디에 현재 시간을 붙여 emitterId를 생성한다.
     */
    private String makeTimeIncludeId(Integer userId) {
        return userId + "_" + System.currentTimeMillis();
    }

    private void sendNotification(SseEmitter emitter, String eventId, String emitterId, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(eventId)
                    .data(data));
        } catch (IOException e) {
            emitterRepo.deleteById(emitterId);
        }
    }

    private boolean hasLostData(String lastEventId) {
        return !lastEventId.isEmpty();
    }

    /**
     * 받지 못한 데이터가 있다면 Last-Event-ID를 기준으로 그 뒤의 데이터를 추출해 알림을 보내준다.
     */
    private void sendLostData(String lastEventId, Integer userId, String emitterId, SseEmitter emitter) {
        Map<String, Object> eventCaches = emitterRepo.findAllEventCacheStartWithByUserId(String.valueOf(userId));
        eventCaches.entrySet().stream()
                .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0)
                .forEach(entry -> sendNotification(emitter, entry.getKey(), emitterId, entry.getValue()));
    }

    /**
     * 어떤 회원에게 알림을 보낼지에 대해 찾고 알림을 받을 회원의 Emitter들을 모두 찾아 해당 Emitter로 Send 시켜준다.
     */
    public void send(User receiver, User sender, NotificationType notificationType, String content, String url) {
        Notification notification = notificationRepo.save(createNotification(receiver, sender, notificationType, content, url));

        String receiverId = String.valueOf(receiver.getUserId());
        String eventId = receiverId + "_" + System.currentTimeMillis();
        Map<String, SseEmitter> emitters = emitterRepo.findAllEmitterStartWithByUserId(receiverId);
        emitters.forEach(
                (key, emitter) -> {
                    emitterRepo.saveEventCache(key, notification); // 유실된 데이터를 관리하기 위해 저장
                    sendNotification(emitter, eventId, key, NotificationResponseDto.fromEntity(notification)); // 데이터 전송
                }
        );
    }

    /**
     * Notification 엔티티를 생성한다.
     */
    private Notification createNotification(User receiver, User sender, NotificationType notificationType, String content, String url) {
        return Notification.builder()
                .receiver(receiver)
                .sender(sender)
                .notificationType(notificationType)
                .content(content)
                .url(url)
                .isRead(false)
                .createDate(LocalDateTime.now())
                .build();
    }

    /**
     * 유저의 알림 전체 목록 조회
     */
    public List<NotificationResponseDto> getList(String authorization) {
        Integer userId = userRepository.findByEmail(jwtTokenService.getUserEmail((jwtTokenService.extractToken(authorization))))
                .get()
                .getUserId();

        List<Notification> notifications = notificationRepo.findAllByReceiverUserIdOrderByCreateDateDesc(userId);
        return notifications.stream()
                .map(NotificationResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 유저 알림 읽음 처리
     */
    public void updateIsRead(String authorization, Integer notificationId) throws Exception {
        Integer userId = userRepository.findByEmail(jwtTokenService.getUserEmail((jwtTokenService.extractToken(authorization))))
                .get()
                .getUserId();

        Optional<Notification> notification = notificationRepo.findById(notificationId);
        if (userId != notification.get().getReceiver().getUserId()) {
            throw new Exception("유저 정보가 일치하지 않습니다.");
        }

        notification.get().setIsReadTrue();
        notificationRepo.save(notification.get());
    }
}
