package com.D104.ccbb.user.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.D104.ccbb.jwt.service.JwtTokenService;
import com.D104.ccbb.user.domain.User;
import com.D104.ccbb.user.dto.KakaoUserDto;
import com.D104.ccbb.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final JwtTokenService jwtTokenService;

	@Value("${spring.security.oauth2.client.provider.kakao.user-info-uri}")
	private String USER_INFO_URI;

	@Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
	private String REDIRECT_URI;

	public String getUserInfoFromKakao(String accessToken) throws Exception {
		// RestTemplate 생성
		RestTemplate restTemplate = new RestTemplate();

		// 요청 URL
		String url = USER_INFO_URI;

		// 헤더 설정
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", accessToken);
		headers.set("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

		// HTTP 엔터티 생성 (헤더와 바디 설정)
		HttpEntity<String> entity = new HttpEntity<>(null, headers);

		// GET 요청 보내기
		ResponseEntity<KakaoUserDto> response = restTemplate.exchange(url, HttpMethod.GET, entity, KakaoUserDto.class);

		// 응답 확인
		KakaoUserDto responseBody;
		if (response.getStatusCode().is2xxSuccessful()) {
			responseBody = response.getBody();
			log.info("Response Body: {}", responseBody);
			log.info(responseBody.toString());
		} else {
			log.info("HTTP Request Failed with status code: " + response.getStatusCode());
			throw new Exception("요청이 실패했습니다.");
		}
		Optional<User> findByEmail = userRepository.findByEmail((String)responseBody.getKakao_account().get("email"));
		String createdToken;

		// 조회 안되면 회원가입
		if (findByEmail.isEmpty()) {
			// 데이터 베이스에 유저 저장
			log.info("회원가입 시작");
			User user = User.builder()
				.name(responseBody.getProperties().get("nickname"))
				.nickname(responseBody.getProperties().get("nickname"))
				.email((String)responseBody.getKakao_account().get("email"))
				.password("asdasdasd")
				.sex(true)
				.createDate(LocalDateTime.now())
				.point(0)
				.build();
			log.info(user.toString());
			User save = userRepository.save(user);
			createdToken = jwtTokenService.createToken(save.getEmail());
			log.info("회원가입 완료");
		} else { // 아니면 로그인
			log.info("로그인 시작");
			createdToken = jwtTokenService.createToken(findByEmail.get().getEmail());
			log.info("로그인 완료");
		}

		return createdToken;
	}
}
