package com.D104.ccbb.notification.repo;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.Map;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.D104.ccbb.notification.domain.Notification;
import com.D104.ccbb.notification.domain.NotificationType;
import com.D104.ccbb.user.domain.User;

class EmitterRepoImplTest {
	private EmitterRepo emitterRepository = new EmitterRepoImpl();
	private Long DEFAULT_TIMEOUT = 60L * 1000L * 60L;

	@Test
	@DisplayName("새로운 Emitter를 추가한다.")
	public void save() throws Exception {
		//given
		Long memberId = 1L;
		String emitterId = memberId + "_" + System.currentTimeMillis();
		SseEmitter sseEmitter = new SseEmitter(DEFAULT_TIMEOUT);

		//when, then
		Assertions.assertDoesNotThrow(() -> emitterRepository.save(emitterId, sseEmitter));
	}

	@Test
	@DisplayName("수신한 이벤트를 캐시에 저장한다.")
	public void saveEventCache() throws Exception {
		//given
		Integer userId = 1;
		String eventCacheId = userId + "_" + System.currentTimeMillis();
		Notification notification = Notification.builder()
			.receiver(new User(1))
			.notificationType(NotificationType.COMMENT)
			.content("test")
			.url("testurl")
			.isRead(false)
			.createDate(LocalDateTime.now())
			.build();
		;

		//when, then
		Assertions.assertDoesNotThrow(() -> emitterRepository.saveEventCache(eventCacheId, notification));
	}

	@Test
	@DisplayName("어떤 회원이 접속한 모든 Emitter를 찾는다")
	public void findAllEmitterStartWithByMemberId() throws Exception {
		//given
		Integer userId = 1;
		String emitterId1 = userId + "_" + System.currentTimeMillis();
		emitterRepository.save(emitterId1, new SseEmitter(DEFAULT_TIMEOUT));

		Thread.sleep(100);
		String emitterId2 = userId + "_" + System.currentTimeMillis();
		emitterRepository.save(emitterId2, new SseEmitter(DEFAULT_TIMEOUT));

		Thread.sleep(100);
		String emitterId3 = userId + "_" + System.currentTimeMillis();
		emitterRepository.save(emitterId3, new SseEmitter(DEFAULT_TIMEOUT));

		//when
		Map<String, SseEmitter> ActualResult = emitterRepository.findAllEmitterStartWithByUserId(
			String.valueOf(userId));

		//then
		Assertions.assertEquals(3, ActualResult.size());
	}

	@Test
	@DisplayName("어떤 회원에게 수신된 이벤트를 캐시에서 모두 찾는다.")
	public void findAllEventCacheStartWithByMemberId() throws Exception {
		//given
		Integer userId = 1;
		String eventCacheId1 = userId + "_" + System.currentTimeMillis();
		Notification notification1 = Notification.builder()
			.receiver(new User(1))
			.notificationType(NotificationType.COMMENT)
			.content("test")
			.url("testurl")
			.isRead(false)
			.createDate(LocalDateTime.now())
			.build();
		;
		emitterRepository.saveEventCache(eventCacheId1, notification1);

		Thread.sleep(100);
		String eventCacheId2 = userId + "_" + System.currentTimeMillis();
		Notification notification2 = Notification.builder()
			.receiver(new User(1))
			.notificationType(NotificationType.COMMENT)
			.content("test")
			.url("testurl")
			.isRead(false)
			.createDate(LocalDateTime.now())
			.build();
		;
		emitterRepository.saveEventCache(eventCacheId2, notification2);

		Thread.sleep(100);
		String eventCacheId3 = userId + "_" + System.currentTimeMillis();
		Notification notification3 = Notification.builder()
			.receiver(new User(1))
			.notificationType(NotificationType.COMMENT)
			.content("test")
			.url("testurl")
			.isRead(false)
			.createDate(LocalDateTime.now())
			.build();
		;
		emitterRepository.saveEventCache(eventCacheId3, notification3);

		//when
		Map<String, Object> ActualResult = emitterRepository.findAllEventCacheStartWithByUserId(String.valueOf(userId));

		//then
		Assertions.assertEquals(3, ActualResult.size());
	}

	@Test
	@DisplayName("ID를 통해 Emitter를 Repository에서 제거한다.")
	public void deleteById() throws Exception {
		//given
		Integer userId = 1;
		String emitterId = userId + "_" + System.currentTimeMillis();
		SseEmitter sseEmitter = new SseEmitter(DEFAULT_TIMEOUT);

		//when
		emitterRepository.save(emitterId, sseEmitter);
		emitterRepository.deleteById(emitterId);

		//then
		Assertions.assertEquals(0, emitterRepository.findAllEmitterStartWithByUserId(emitterId).size());
	}

	@Test
	@DisplayName("저장된 모든 Emitter를 제거한다.")
	public void deleteAllEmitterStartWithId() throws Exception {
		//given
		Integer userId = 1;
		String emitterId1 = userId + "_" + System.currentTimeMillis();
		emitterRepository.save(emitterId1, new SseEmitter(DEFAULT_TIMEOUT));

		Thread.sleep(100);
		String emitterId2 = userId + "_" + System.currentTimeMillis();
		emitterRepository.save(emitterId2, new SseEmitter(DEFAULT_TIMEOUT));

		//when
		emitterRepository.deleteAllEmitterStartWithId(String.valueOf(userId));

		//then
		Assertions.assertEquals(0, emitterRepository.findAllEmitterStartWithByUserId(String.valueOf(userId)).size());
	}

	@Test
	@DisplayName("수신한 이벤트를 캐시에 저장한다.")
	public void deleteAllEventCacheStartWithId() throws Exception {
		//given
		Integer userId = 1;
		String eventCacheId1 = userId + "_" + System.currentTimeMillis();
		Notification notification1 = Notification.builder()
			.receiver(new User(1))
			.notificationType(NotificationType.COMMENT)
			.content("test")
			.url("testurl")
			.isRead(false)
			.createDate(LocalDateTime.now())
			.build();
		;
		emitterRepository.saveEventCache(eventCacheId1, notification1);

		Thread.sleep(100);
		String eventCacheId2 = userId + "_" + System.currentTimeMillis();
		Notification notification2 = Notification.builder()
			.receiver(new User(1))
			.notificationType(NotificationType.COMMENT)
			.content("test")
			.url("testurl")
			.isRead(false)
			.createDate(LocalDateTime.now())
			.build();
		;
		emitterRepository.saveEventCache(eventCacheId2, notification2);

		//when
		emitterRepository.deleteAllEventCacheStartWithId(String.valueOf(userId));

		//then
		Assertions.assertEquals(0,
			emitterRepository.findAllEventCacheStartWithByUserId(String.valueOf(userId)).size());
	}
}