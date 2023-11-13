package com.D104.ccbb.wod.domian;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import com.D104.ccbb.post.domain.Post;
import com.D104.ccbb.user.domain.User;
import com.D104.ccbb.vote.domain.Vote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wod {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "wod_id", nullable = false)
	private Integer wodId;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User userId;

	@ManyToOne
	@JoinColumn(name = "post_id", nullable = false)
	private Post postId;

}
