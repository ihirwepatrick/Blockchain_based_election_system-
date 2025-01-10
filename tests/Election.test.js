const Election = artifacts.require("Election");

contract("Election", accounts => {
    let election;

    const [admin, voter1, voter2] = accounts;

    beforeEach(async () => {
        election = await Election.new("Rwanda Presidential Election 2025", { from: admin });
    });

    it("should create an election with the correct name", async () => {
        const name = await election.electionName();
        assert.equal(name, "Rwanda Presidential Election 2025", "Election name should be correct.");
    });

    it("should allow admin to add candidates", async () => {
        await election.addCandidate("Candidate 1", { from: admin });
        const candidates = await election.getCandidates();
        assert.equal(candidates.length, 1, "There should be one candidate.");
        assert.equal(candidates[0].name, "Candidate 1", "Candidate name should be correct.");
    });

    it("should allow admin to authorize a voter", async () => {
        await election.authorizeVoter(voter1, { from: admin });
        const voter = await election.voters(voter1);
        assert.equal(voter.authorized, true, "Voter should be authorized.");
    });

    it("should allow authorized voters to vote", async () => {
        await election.authorizeVoter(voter1, { from: admin });
        await election.addCandidate("Candidate 1", { from: admin });
        await election.vote(0, { from: voter1 });
        
        const candidates = await election.getCandidates();
        assert.equal(candidates[0].voteCount, 1, "Vote count for the candidate should be 1.");
    });

    it("should not allow double voting", async () => {
        await election.authorizeVoter(voter1, { from: admin });
        await election.addCandidate("Candidate 1", { from: admin });
        await election.vote(0, { from: voter1 });

        try {
            await election.vote(0, { from: voter1 });
            assert.fail("The vote should not be allowed twice.");
        } catch (error) {
            assert.include(error.message, "You have already voted", "Error message should indicate double voting.");
        }
    });

    it("should end the election and declare the winner", async () => {
        await election.authorizeVoter(voter1, { from: admin });
        await election.authorizeVoter(voter2, { from: admin });
        await election.addCandidate("Candidate 1", { from: admin });
        await election.addCandidate("Candidate 2", { from: admin });

        await election.vote(0, { from: voter1 });
        await election.vote(1, { from: voter2 });

        await election.endElection({ from: admin });

        const winnerId = await election.electionEnded();
        assert.equal(winnerId.toString(), "0", "The winner should be the candidate with the most votes.");
    });
});
