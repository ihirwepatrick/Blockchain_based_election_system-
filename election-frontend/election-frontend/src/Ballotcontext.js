import React, { useEffect } from "react";
import { useBallot } from "./BallotContext";

const ProposalsList = () => {
  const { proposals, fetchProposals, contract } = useBallot();

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleVote = async (proposalIndex) => {
    try {
      const tx = await contract.vote(proposalIndex);
      await tx.wait();
      alert("Vote cast successfully!");
      fetchProposals();
    } catch (err) {
      console.error("Error casting vote:", err);
    }
  };

  return (
    <div>
      <h2>Proposals</h2>
      <ul>
        {proposals.map((proposal, index) => (
          <li key={index}>
            {proposal.name} - Votes: {proposal.voteCount}
            <button onClick={() => handleVote(index)}>Vote</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProposalsList;
