package com.D104.ccbb.notification.dto;

import com.D104.ccbb.notification.domain.NotificationType;
import com.D104.ccbb.post.domain.Post;
import com.D104.ccbb.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequestDto {

    private User receiver;
    private String content;
    private String url;
    private NotificationType notificationType;

    public static NotificationRequestDto commentOf(Post post) {

		Integer postId = post.getPostId();
		User receiver = post.getUserId();
		String content = post.getTitle();
		if (content.length() > 12) {
			content = content.substring(0, 12) + "...";
		}
		content = "님이 회원님이 작성하신 '" + content + "'에 답변을 달았습니다.";
		String url = "/lolvote/detail/" + postId;

        return new NotificationRequestDto(receiver, content, url, NotificationType.COMMENT);
    }

	public static NotificationRequestDto voteRequestOf(Post post, User receiver) {

		Integer postId = post.getPostId();
		String content = post.getTitle();
		if (content.length() > 12) {
			content = content.substring(0, 12) + "...";
		}
		content = "님이 회원님께 '" + content + "'의 투표 진행을 신청하였습니다.";
		String url = "/lolvote/detail/" + postId;

		return new NotificationRequestDto(receiver, content, url, NotificationType.VOTE_REQUEST);
	}


}
