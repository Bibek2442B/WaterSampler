const express = require("express")
const fs = require("fs")
const app = express();
const PORT = 3000
const SAMPLER_TIME = 10000;

app.use(express.json())

let samplerState = {}

function makeSchedule(data){

  if(data.day<1 || data.day>7) throw new Error("Invalid day of week");

  const hours= data.time.getHours();
  const minutes = data.time.getMinutes();
  const totalDuration = data.burst * data.interval;
  const startTotalMinutes = hours * 60 + minutes;
  if(startTotalMinutes + totalDuration > 23*60+59) throw new Error("Invalid Schedule: Sampling duration crosses to next day.");

  function getNthWeekdayofMonth(year, month, weekday, nth){
    const firstDayofMonth = new Date(year, month, 1);
    const firstWeekdayOffset = (weekday+7 -firstDayofMonth.getDay()) % 7;
    const date = 1 + firstWeekdayOffset + (nth-1) * 7;
    return new Date(year, month, date, hours, minutes);
  }

  const now = new Date();
  let scheduleDate = getNthWeekdayofMonth(
    now.getFullYear(),
    now.getMonth(),
    data.day-1,
    data.week
  );

  if(scheduleDate<=now){
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    scheduleDate = getNthWeekdayofMonth(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      data.day-1,
      data.week
    );
  }

  return {
    scheduledAt: scheduleDate,
    burst: data.burst,
    interval: data.interval,
    volume: data.volume,
    endsAt: new Date(
      scheduleDate.getTime() + totalDuration * 60000
    ),
  }
}

if(fs.existsSync('samplerState.json')){
  samplerState = JSON.parse(
    fs.readFileSync('samplerState.json')
  )
}

app.listen(PORT, ()=> console.log(`Sampler listening on PORT ${PORT}!`));

app.get('/', (req, res) => {
  console.log(`Get Request Sampler State: `, samplerState);
  return res.send(samplerState);
})
app.post('/', (req, res)=>{
  if(samplerState.status === "HAS_SAMPLE" || samplerState.status === "TAKING_SAMPLE"){
    return res.sendStatus(400);
  }
  const data = req.body;
  data.time = new Date(data.time);
  data.week = parseInt(data.week);
  data.day = parseInt(data.day);

  let schedule = {}
  try{
    console.log(data);
    schedule = makeSchedule(data);
  }catch(e){
    console.log(e);
    return res.sendStatus(400);
  }
  console.log(schedule);
  let newState = {};
  newState['status']='SCHEDULED';
  newState['schedule']=schedule;
  samplerState = newState;
  console.log(`Sampler Sate After Post: `, samplerState);
  fs.writeFileSync(
    'samplerState.json',
    JSON.stringify(samplerState)
  );
  res.sendStatus(200);
})

setInterval(()=>{
  if(samplerState.status === 'SCHEDULED' && new Date(samplerState.schedule.scheduledAt) <= new Date()){
    samplerState.status='TAKING_SAMPLE';
    fs.writeFileSync(
      'samplerState.json',
      JSON.stringify(samplerState)
    );
    console.log(`Sampler started!`);

    setTimeout(()=>{
      samplerState.status='HAS_SAMPLE';
      fs.writeFileSync(
        'samplerState.json',
        JSON.stringify(samplerState)
      );
      console.log(`Sampling Completed!`)
    },((samplerState.schedule.interval*(samplerState.schedule.burst-1))+SAMPLER_TIME))
  }
},2000);



