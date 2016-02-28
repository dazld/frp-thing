import Bacon from 'baconjs';


const nums = Bacon.repeatedly(1000, [1,2,3]);

nums.map(v => v + 1 ).take(10).log()
