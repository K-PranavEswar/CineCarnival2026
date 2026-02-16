import mongoose from "mongoose";

const castSchema=new mongoose.Schema({
name:{type:String,required:true},
role:{type:String,default:""},
image:{type:String,default:""}
},{_id:false});

const movieSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
poster:{type:String,required:true},
banner:{type:String,default:""},
description:{type:String,default:""},
duration:{type:String,required:true},
language:{type:String,required:true},
rating:{type:Number,default:0,min:0,max:10},
genre:{type:String,default:""},
releaseDate:{type:String,default:""},
ticketPrice:{type:Number,default:69,min:0},
showTime:{type:String,default:""},
showOrder:{type:Number,default:0},
cast:{type:[castSchema],default:[]}
},{timestamps:true});

export default mongoose.model("Movie",movieSchema);
