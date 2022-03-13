pragma solidity ^0.5.0;

contract TodoList {
    uint public taskCount = 0; // public automatically creates a getter for this taskCount

    struct Task {
        uint id;
        string content;
        bool completed;
    }

    mapping(uint => Task) public tasks; // takes a key value pair and is similar to a hash in javascript

    event TaskCreated(
        uint id,
        string content,
        bool completed
    ); // allows you to listen to this event and is available for us to use

    constructor() public { // this runs when the start contract is being deployed for the first time
        createTask("Edmond is the best"); // this creates a default task to the TodoList 
    }

    function createTask(string memory _content) public {
        taskCount ++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false); // triggers this event in the smart contract
    }
}