import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from './models/Movie.js';

const movies=[
{
name:'Rajamanikyam',
poster:'/images/RAJAMANIKYAM.jpg',
banner:'/images/RAJAMANIKYAM-BANNER.jpg',
description:'Rajamanikyam is a 2005 Indian Malayalam-language action comedy film directed by Anwar Rasheed.',
duration:'2h 45m',
language:'Malayalam',
rating:8.2,
genre:'Action, Comedy',
releaseDate:'2005',
ticketPrice:69,
showTime:'9:30 AM - 12:30 PM',
showOrder:1,
cast:[
{name:'Mammootty',role:'Rajamanikyam',image:'/images/mammootty.jpg'},
{name:'Rahman',role:'Raju',image:'/images/rahman.jpg'},
{name:'Saikumar',role:'Rajarathnam',image:'/images/saikumar.jpg'},
{name:'Padmapriya',role:'Mallika',image:'/images/padmapriya.jpg'},
{name:'Manoj K Jayan',role:'Rajaselvam',image:'/images/manoj.jpg'},
{name:'Salim Kumar',role:'Dasappan',image:'/images/salimkumar.jpg'},
{name:'Cochin Haneefa',role:'Varghese',image:'/images/haneefa.jpg'}
]
},
{
name:'Chotta Mumbai',
poster:'/images/CHOTTAMUMBAI.jpg',
banner:'/images/CHOTTAMUMBAI-BANNER.jpg',
description:'Chotta Mumbai is a 2007 Indian Malayalam-language action comedy film directed by Anwar Rasheed.',
duration:'2h 35m',
language:'Malayalam',
rating:7.8,
genre:'Action, Comedy',
releaseDate:'2007',
ticketPrice:69,
showTime:'1:30 PM - 4:00 PM',
showOrder:2,
cast:[
{name:'Mohanlal',role:'Vasco',image:'/images/mohanlal.jpg'},
{name:'Siddique',role:'Mullan',image:'/images/siddique.jpg'},
{name:'Kalabhavan Mani',role:'Nadeshan',image:'/images/mani.jpg'},
{name:'Jagathy',role:'Paddakam',image:'/images/jagathy.jpg'},
{name:'Indrajith',role:'Tomichan',image:'/images/indrajith.jpg'},
{name:'Bhavana',role:'Latha',image:'/images/bhavana.jpg'},
{name:'Maniyanpilla Raju',role:'Advocate',image:'/images/maniyanpilla.jpg'}
]
}
];

async function seed(){
try{
await mongoose.connect(process.env.MONGODB_URI);
for(const m of movies){
await Movie.updateOne(
{name:m.name},
{$set:m},
{upsert:true}
);
}
console.log('Movies seeded successfully');
process.exit(0);
}catch(err){
console.error(err.message);
process.exit(1);
}finally{
await mongoose.disconnect();
}
}

seed();
