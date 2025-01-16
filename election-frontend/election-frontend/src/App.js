import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import BallotABI from "./BallotABI.json"; // Replace with your ABI file

const BallotContext = createContext();

const BallotProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [winner, setWinner] = useState("");

  const contractAddress = "0xYourDeployedContractAddress"; // Replace with your contract address

  // Initialize ethers.js
  useEffect(() => {
    const initBlockchain = async () => {
      if (window.ethereum) {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        const _signer = _provider.getSigner();
        const _contract = new ethers.Contract(contractAddress, BallotABI, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
      } else {
        console.error("Ethereum wallet not found");
      }
    };
    initBlockchain();
  }, []);

  // Fetch proposals
  const fetchProposals = async () => {
    if (contract) {
      const proposalCount = await contract.proposals.length;
      const _proposals = [];
      for (let i = 0; i < proposalCount; i++) {
        const proposal = await contract.proposals(i);
        _proposals.push({
          name: ethers.utils.parseBytes32String(proposal.name),
          voteCount: proposal.voteCount.toNumber(),
        });
      }
      setProposals(_proposals);
    }
  };

  // Fetch winning proposal
  const fetchWinner = async () => {
    if (contract) {
      const winnerName = await contract.winnerName();
      setWinner(ethers.utils.parseBytes32String(winnerName));
    }
  };

  return (
    <BallotContext.Provider
      value={{
        proposals,
        winner,
        fetchProposals,
        fetchWinner,
        contract,
      }}
    >
      {children}
    </BallotContext.Provider>
  );
};

export const useBallot = () => useContext(BallotContext);

export default BallotProvider;
