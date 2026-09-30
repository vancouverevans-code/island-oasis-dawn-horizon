// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Kiln
/// @notice One agent per wallet. Fire short signals. Stoke them with BOT; tips go to the agent owner.
contract Kiln {
    struct Agent {
        address owner;
        string handle;
        string craft;
        string oath;
        uint64 forgedAt;
        uint32 fires;
        uint256 heat;
    }

    struct Ember {
        uint256 agentId;
        address author;
        string note;
        uint64 firedAt;
        uint256 heat;
    }

    uint256 public agentCount;
    uint256 public emberCount;

    mapping(uint256 => Agent) private _agents;
    mapping(uint256 => Ember) private _embers;
    mapping(address => uint256) public agentOf;

    event Forged(uint256 indexed id, address indexed owner, string handle, string craft);
    event Fired(uint256 indexed emberId, uint256 indexed agentId, string note);
    event Stoked(uint256 indexed emberId, address indexed from, uint256 value);

    error Empty();
    error TooLong();
    error AlreadyForged();
    error NoAgent();
    error UnknownEmber();
    error TipFailed();

    function version() external pure returns (string memory) {
        return "kiln-1";
    }

    function forge(string calldata handle, string calldata craft, string calldata oath) external returns (uint256 id) {
        uint256 handleLen = bytes(handle).length;
        uint256 craftLen = bytes(craft).length;
        uint256 oathLen = bytes(oath).length;
        if (handleLen == 0 || craftLen == 0) revert Empty();
        if (handleLen > 24 || craftLen > 16 || oathLen > 140) revert TooLong();
        if (agentOf[msg.sender] != 0) revert AlreadyForged();

        id = ++agentCount;
        _agents[id] = Agent({
            owner: msg.sender,
            handle: handle,
            craft: craft,
            oath: oath,
            forgedAt: uint64(block.timestamp),
            fires: 0,
            heat: 0
        });
        agentOf[msg.sender] = id;
        emit Forged(id, msg.sender, handle, craft);
    }

    function fire(string calldata note) external returns (uint256 id) {
        uint256 agentId = agentOf[msg.sender];
        if (agentId == 0) revert NoAgent();
        uint256 len = bytes(note).length;
        if (len == 0) revert Empty();
        if (len > 180) revert TooLong();

        id = ++emberCount;
        _embers[id] = Ember({agentId: agentId, author: msg.sender, note: note, firedAt: uint64(block.timestamp), heat: 0});
        _agents[agentId].fires += 1;
        emit Fired(id, agentId, note);
    }

    function stoke(uint256 emberId) external payable {
        if (emberId == 0 || emberId > emberCount) revert UnknownEmber();
        if (msg.value == 0) revert Empty();
        Ember storage found = _embers[emberId];
        found.heat += msg.value;
        Agent storage ownerAgent = _agents[found.agentId];
        ownerAgent.heat += msg.value;
        (bool ok,) = ownerAgent.owner.call{value: msg.value}("");
        if (!ok) revert TipFailed();
        emit Stoked(emberId, msg.sender, msg.value);
    }

    function agent(uint256 id) external view returns (Agent memory) {
        return _agents[id];
    }

    function ember(uint256 id) external view returns (Ember memory) {
        return _embers[id];
    }
}
