import { useState,useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { theatresAPI,moviesAPI } from "../services/api";
import { MapPin,Info,ChevronRight,Sparkles,Clock } from "lucide-react";

export default function TheatreSelection(){

const { movieId }=useParams();
const navigate=useNavigate();

const [movie,setMovie]=useState(null);
const [theatres,setTheatres]=useState([]);
const [selectedDate,setSelectedDate]=useState(0);
const [loading,setLoading]=useState(true);
const [error,setError]=useState("");

useEffect(()=>{
let cancelled=false;

Promise.all([
moviesAPI.getAll().then(r=>r.data.find(m=>m._id===movieId)),
theatresAPI.getByMovie(movieId).then(r=>r.data)
])
.then(([m,t])=>{
if(cancelled)return;
setMovie(m||null);
setTheatres(t||[]);
})
.catch(err=>{
if(cancelled)return;
setError(err.response?.data?.message||"Failed to load");
})
.finally(()=>{
if(cancelled)return;
setLoading(false);
});

return()=>cancelled=true;

},[movieId]);

if(loading)return <LoadingState/>;
if(error||!movie)return <ErrorState message={error}/>;

return(
<div className="min-h-screen bg-[#060607] text-white">

<section className="relative h-[55vh] overflow-hidden">

<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black z-10"/>

<img
src={movie.banner||movie.poster}
className="w-full h-full object-cover opacity-40 blur-2xl scale-125"
/>

<div className="absolute bottom-10 left-0 right-0 z-20 max-w-6xl mx-auto px-6 flex gap-8 items-end">

<div className="hidden md:block relative">
<img
src={movie.poster}
className="w-48 h-72 object-cover rounded-2xl border border-white/10 shadow-2xl"
/>
<div className="absolute -top-3 -right-3 bg-carnival-primary text-black p-2 rounded-xl">
<Sparkles size={18}/>
</div>
</div>

<div>

<div className="flex gap-3 mb-3 flex-wrap">
<Badge text={movie.language} primary/>
<Badge text={movie.duration} icon={<Clock size={12}/>}/>
<Badge text="2D"/>
</div>

<h1 className="text-5xl lg:text-7xl font-black italic uppercase">
{movie.name}
</h1>

<p className="mt-3 text-slate-400 max-w-xl">
{movie.description}
</p>

</div>

</div>

</section>


<section className="max-w-6xl mx-auto px-6 py-10">

<h2 className="text-xl font-bold mb-6 flex items-center gap-3">
<span className="w-2 h-8 bg-carnival-primary rounded-full"/>
CAST
</h2>

{movie.cast&&movie.cast.length>0?(
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

{movie.cast.map((c,i)=>(

<div key={i}>

<div className="overflow-hidden rounded-2xl border border-white/10">
<img
src={c.image}
className="w-full h-44 object-cover hover:scale-110 transition"
/>
</div>

<p className="mt-3 font-semibold text-sm">
{c.name}
</p>

<p className="text-xs text-slate-400">
{c.role}
</p>

</div>

))}

</div>

):(
<p className="text-slate-500">No cast available</p>
)}

</section>


<nav className="sticky top-0 bg-black/80 backdrop-blur border-b border-white/10">

<div className="max-w-6xl mx-auto px-6 py-4 flex gap-4 overflow-x-auto">

{["Today","Tomorrow","18 Feb","19 Feb","20 Feb"].map((d,i)=>(

<button
key={i}
onClick={()=>setSelectedDate(i)}
className={`px-5 py-3 rounded-xl border ${
selectedDate===i
?"bg-carnival-primary text-black border-carnival-primary"
:"bg-white/5 border-white/10 text-gray-400"
}`}
>
{d}
</button>

))}

</div>

</nav>


<main className="max-w-6xl mx-auto px-6 py-10">

<div className="flex justify-between mb-6">
<h2 className="text-xl font-bold flex gap-3 items-center">
<span className="w-2 h-8 bg-carnival-primary rounded-full"/>
SELECT THEATRE
</h2>

<span className="text-gray-500 text-sm">
Found {theatres.length} venues
</span>

</div>

{theatres.length===0?(
<div className="text-center text-gray-500 py-20">
No theatres found
</div>
):(

<div className="grid gap-6">

{theatres.map(t=>{

const total=t.seats?.flat().length||100;
const booked=t.bookedSeats?.length||0;
const available=total-booked;
const percent=(booked/total)*100;

return(

<TheatreCard
key={t._id}
theatre={t}
available={available}
percent={percent}
showTime={movie.showTime}
onClick={()=>navigate(`/movie/${movieId}/theatre/${t._id}/seats`)}
/>

);

})}

</div>

)}

</main>

</div>
);

}


function Badge({text,primary,icon}){

return(
<span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
primary
?"bg-carnival-primary text-black"
:"bg-white/10 text-white/70"
}`}>
{icon}{text}
</span>
);

}


function TheatreCard({theatre,available,percent,showTime,onClick}){

return(
<button
onClick={onClick}
className="w-full text-left bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-carnival-primary transition"
>

<div className="flex items-center gap-6">

<MapPin className="text-carnival-primary"/>

<div className="flex-1">

<h3 className="text-2xl font-bold">
{theatre.name}
</h3>

<p className="text-sm text-gray-400 mt-1">
{available} seats left
</p>

<div className="w-full h-2 bg-white/10 rounded mt-2">
<div
className="h-full bg-carnival-primary rounded"
style={{width:`${percent}%`}}
/>
</div>

</div>

<div className="text-right">

<p className="text-xs text-gray-500 uppercase">
Standard show
</p>

<p className="text-2xl font-bold">
{showTime}
</p>

</div>

<ChevronRight/>

</div>

</button>
);

}


function LoadingState(){

return(
<div className="min-h-screen flex items-center justify-center">
<div className="w-16 h-16 border-4 border-carnival-primary border-t-transparent rounded-full animate-spin"/>
</div>
);

}


function ErrorState({message}){

return(
<div className="min-h-screen flex items-center justify-center text-red-500">
{message||"Error"}
</div>
);

}
