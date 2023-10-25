package com.D104.ccbb.ballot_box.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.D104.ccbb.ballot_box.domain.BallotBox;
import com.D104.ccbb.ballot_box.dto.BallotBoxDto;
import com.D104.ccbb.ballot_box.repo.BallotBoxRepo;
import com.D104.ccbb.user.repository.UserRepository;
import com.D104.ccbb.vote.repo.VoteRepo;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BallotBoxService {

	private final BallotBoxRepo ballotBoxRepo;
	private final UserRepository userRepository;
	private final VoteRepo voteRepo;

	public void setBallotBox(BallotBoxDto ballotBoxDto) {
		BallotBox ballotBox = BallotBox.builder()
			.ballotBoxId(ballotBoxDto.getBallotBoxId())
			.pick(ballotBoxDto.getPick())
			.userId(userRepository.getReferenceById(ballotBoxDto.getUserId()))
			.voteId(voteRepo.getReferenceById(ballotBoxDto.getVoteId()))
			.build();
		ballotBoxRepo.save(ballotBox);
	}

}
