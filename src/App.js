import React, { Component, useState, useEffect } from 'react';
import './App.css';

// Extract stars as component and since a component should hold one sigle element and here we are using map we need to wrap it into a fragment
const StarsDisplay = props => (
  <>
    {utils.range(1,props.count).map(starId => 
      <div key={starId} className="star" />
    )}
  </>
);

// Extract play button compoenent
const PlayNumber = props => (
  <button
    className="number"
    style = {{ backgroundColor: colors[props.status]}}
    onClick={() => props.onClick(props.number, props.status)}
  > 
  {props.number}
  </button>
);

// Add playAgain component which will be shown after the game is done 
const PlayAgain = props => (
  <div className="game-done">
    <div
      className = "message"
      style = {{ color: props.gameStatus === 'lost' ? 'red' : 'green'}}
    >
      {props.gameStatus === 'lost'? 'Game Over' : 'You Won!'}
    </div>
    <button onClick={props.onClick}> Play Again</button>
  </div>
);

// Introduce a custom hook to hold that will manage the states of the game 
const useGameState = () => {
  const [stars,setStars] = useState(utils.random(1,9));
  const [availableNums, setAvailableNums] = useState(utils.range(1,9));
  const [candidateNums, setCandidateNums] = useState([]);
  
  const [secondsLeft, setSecondsLeft] = useState(10); // add seconds left state 

  // Add secondsLeft side effect using setTimeout with useEffect method instead of setIntervale to learn more about react hooks 

  useEffect(()=>{
    // The effect itself run after the componenet got rendred
    // invoke the function if the secondsLeft > 0
    if(secondsLeft > 0 && availableNums.length > 0){
      const timerId = setTimeout(()=>{
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      // clear the Timout after each change (the component is about rerendring) on the component to avoid create the setTimout on every state change even once not needed this can be done using return statement which can invoke a function => it is a mecanism of use Effect hook 
      return () => clearTimeout(timerId);
    }
  });

  // hold the set states in same place too
  const setGameState = (newCandidateNums) =>{if (utils.sum(newCandidateNums) !== stars) {
    setCandidateNums(newCandidateNums);
  } else {
    const newAvailableNums = availableNums.filter(
      n => !newCandidateNums.includes(n)
    );
    setStars(utils.randomSumIn(newAvailableNums,9));
    setAvailableNums(newAvailableNums);
    setCandidateNums([]);
  }};
  return {stars, availableNums, candidateNums, secondsLeft, setGameState} 
};


// v1 STAR MATCH - Starting Template

const Game = (props) => {
  const {
    stars,
    availableNums,
    candidateNums,
    secondsLeft,
    setGameState,
  } = useGameState();

  const candidatesAreWrong = utils.sum(candidateNums) > stars; // Cehcek if the candidates are wrong 

  // const gameIsDone = availableNums.length === 0; // check if the game is done or not => no more needed we can use gameStatus instead

  // check the game status after seconds left is 0 
  const gameStatus = availableNums.length === 0 ? 'won' : secondsLeft === 0 ? 'lost' : 'active'

  // Reset the game one the game is done => no need anymore after using the logic of key elemnt and unmounting see StartMatch component
  // const resetGame = () => {
  //   setStars(utils.random(1,9));
  //   setAvailableNums(utils.range(1,9));
  //   setCandidateNums([]);
  // }

  const numberStatus = number => {
    if(!availableNums.includes(number)){
      return 'used';
    }
    if(candidateNums.includes(number)){
      return candidatesAreWrong ? 'wrong' : 'candidate';
    }
    return 'available'
  };
  const onNumberClick = (number, currentStatus) => {
    if (gameStatus !== 'active' || currentStatus === 'used') {
      return;
    }
    const newCandidateNums = 
      currentStatus === 'available' ? candidateNums.concat(number) : candidateNums.filter( cn => cn !== number);

    setGameState(newCandidateNums);
  };

  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {
            gameStatus !== 'active' ? (
              <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
            ) : (
              <StarsDisplay count={stars}></StarsDisplay>
            )
          }
            
        </div>
        <div className="right">
          {utils.range(1,9).map(number=>
              <PlayNumber
                key={number}
                status = {numberStatus(number)}
                number={number}
                onClick = {onNumberClick}
                > 
              </PlayNumber>
          )}
          
        </div>
      </div>
          <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

// Create the StartMatch Game componenet which will hold the logic of the start game
const StarMatch = () => {
	const [gameId, setGameId] = useState(1);
	return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)}/>;
}


// Color Theme
const colors = {
  available: 'lightgray',
  used: 'lightgreen',
  wrong: 'lightcoral',
  candidate: 'deepskyblue',
};

// Math science
const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  },
};



class App extends Component {
  render() {
    return (
      <div>
        <StarMatch></StarMatch>
      </div>
  
    );
  }
}
export default App;


