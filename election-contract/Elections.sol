// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool authorized;
        bool voted;
        uint vote;
    }

    address public electionAdmin;
    string public electionName;

    mapping(address => Voter) public voters;
    Candidate[] public candidates;

    bool public electionEnded;

    event ElectionCreated(string name);
    event VoterAuthorized(address voter);
    event VoteCasted(address voter, uint candidateId);
    event ElectionEnded(uint winnerId);

    modifier onlyAdmin() {
        require(msg.sender == electionAdmin, "Only admin can perform this action.");
        _;
    }

    constructor(string memory _name) {
        electionAdmin = msg.sender;
        electionName = _name;
        emit ElectionCreated(_name);
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidates.push(Candidate(candidates.length, _name, 0));
    }

    function authorizeVoter(address _voter) public onlyAdmin {
        voters[_voter].authorized = true;
        emit VoterAuthorized(_voter);
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender].voted, "You have already voted.");
        require(voters[msg.sender].authorized, "You are not authorized to vote.");
        require(_candidateId < candidates.length, "Invalid candidate ID.");
        require(!electionEnded, "Election has ended.");

        voters[msg.sender].voted = true;
        voters[msg.sender].vote = _candidateId;

        candidates[_candidateId].voteCount++;
        emit VoteCasted(msg.sender, _candidateId);
    }

    function endElection() public onlyAdmin {
        require(!electionEnded, "Election already ended.");
        electionEnded = true;

        uint maxVotes = 0;
        uint winnerId;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        emit ElectionEnded(winnerId);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}
