import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose"
import Booking from "../models/Booking.js"
import Theatre from "../models/Theatre.js"
import Movie from "../models/Movie.js"
import QRCode from "qrcode"
import Razorpay from "razorpay"
import crypto from "crypto"

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
throw new Error("Razorpay keys missing in .env file")
}

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
})

const generateQR = async (booking, movie, theatre) => {
const payload = JSON.stringify({
bookingId: booking._id.toString(),
movieName: movie.name,
theatreName: theatre.name,
seatNumbers: booking.seats,
userId: booking.userId.toString()
})
return await QRCode.toDataURL(payload, { width: 256, margin: 2 })
}

export const createBooking = async (req, res) => {

const session = await mongoose.startSession()
session.startTransaction()

try {

const { movieId, theatreId, seats } = req.body
const userId = req.user._id

if (!movieId || !theatreId || !seats?.length)
throw new Error("Movie theatre seats required")

const theatre = await Theatre.findById(theatreId).session(session)

if (!theatre)
throw new Error("Theatre not found")

if (theatre.movieId.toString() !== movieId)
throw new Error("Invalid theatre")

const flatSeats = theatre.seats.flat()

for (const s of seats) {
if (!flatSeats.includes(s))
throw new Error(`Invalid seat ${s}`)
}

const updated = await Theatre.findOneAndUpdate(
{ _id: theatreId, bookedSeats: { $nin: seats } },
{ $addToSet: { bookedSeats: { $each: seats } } },
{ new: true, session }
)

if (!updated)
throw new Error("Seats already booked")

const movie = await Movie.findById(movieId).session(session)

const bookingArr = await Booking.create([{
userId,
movieId,
theatreId,
seats,
isPaid: true,
payment: { status: "paid" }
}], { session })

const booking = bookingArr[0]

const qr = await generateQR(booking, movie, theatre)

booking.qrCode = qr

await booking.save({ session })

await session.commitTransaction()

const populated = await Booking.findById(booking._id)
.populate("movieId")
.populate("theatreId")
.populate("userId", "name email")

res.status(201).json(populated)

} catch (err) {

await session.abortTransaction()

res.status(400).json({ message: err.message })

} finally {

session.endSession()

}

}

export const createRazorpayOrder = async (req, res) => {

try {

const { movieId, theatreId, seats } = req.body
const userId = req.user._id

if (!movieId || !theatreId || !seats?.length)
throw new Error("Movie theatre seats required")

const theatre = await Theatre.findById(theatreId)

if (!theatre)
throw new Error("Theatre not found")

const movie = await Movie.findById(movieId)

if (!movie)
throw new Error("Movie not found")

const flatSeats = theatre.seats.flat()

for (const s of seats) {
if (!flatSeats.includes(s))
throw new Error(`Invalid seat ${s}`)
}

const already = seats.filter(s => theatre.bookedSeats.includes(s))

if (already.length)
throw new Error(`Already booked ${already.join(",")}`)

const amount = movie.ticketPrice * seats.length * 100

const order = await razorpay.orders.create({
amount,
currency: "INR",
receipt: `rcpt_${Date.now()}`
})

const booking = await Booking.create({
userId,
movieId,
theatreId,
seats,
isPaid: false,
payment: {
orderId: order.id,
status: "pending"
}
})

res.json({
order,
bookingId: booking._id
})

} catch (err) {

res.status(400).json({
message: err.message
})

}

}

export const verifyPayment = async (req, res) => {

const session = await mongoose.startSession()
session.startTransaction()

try {

const {
razorpay_order_id,
razorpay_payment_id,
razorpay_signature,
bookingId
} = req.body

if (!bookingId)
throw new Error("BookingId required")

const expected = crypto
.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
.update(`${razorpay_order_id}|${razorpay_payment_id}`)
.digest("hex")

if (expected !== razorpay_signature)
throw new Error("Invalid signature")

const booking = await Booking.findById(bookingId).session(session)

if (!booking)
throw new Error("Booking not found")

if (booking.isPaid)
throw new Error("Already paid")

const theatre = await Theatre.findById(booking.theatreId).session(session)

const updated = await Theatre.findOneAndUpdate(
{ _id: theatre._id, bookedSeats: { $nin: booking.seats } },
{ $addToSet: { bookedSeats: { $each: booking.seats } } },
{ session }
)

if (!updated)
throw new Error("Seats already booked")

const movie = await Movie.findById(booking.movieId).session(session)

const qr = await generateQR(booking, movie, theatre)

booking.qrCode = qr
booking.isPaid = true

booking.payment = {
orderId: razorpay_order_id,
paymentId: razorpay_payment_id,
signature: razorpay_signature,
status: "paid"
}

await booking.save({ session })

await session.commitTransaction()

const populated = await Booking.findById(booking._id)
.populate("movieId")
.populate("theatreId")
.populate("userId", "name email")

res.json(populated)

} catch (err) {

await session.abortTransaction()

res.status(400).json({
message: err.message
})

} finally {

session.endSession()

}

}

export const getUserBookings = async (req, res) => {

const bookings = await Booking.find({
userId: req.params.userId,
isPaid: true
})
.populate("movieId")
.populate("theatreId")
.sort({ createdAt: -1 })

res.json(bookings)

}

export const getAllBookings = async (req, res) => {

const bookings = await Booking.find({ isPaid: true })
.populate("userId", "name email")
.populate("movieId")
.populate("theatreId")
.sort({ createdAt: -1 })

res.json(bookings)

}

export const deleteBooking = async (req, res) => {

const session = await mongoose.startSession()
session.startTransaction()

try {

const booking = await Booking.findById(req.params.bookingId).session(session)

if (!booking)
throw new Error("Booking not found")

await Theatre.updateOne(
{ _id: booking.theatreId },
{ $pull: { bookedSeats: { $in: booking.seats } } },
{ session }
)

await booking.deleteOne({ session })

await session.commitTransaction()

res.json({ message: "Deleted" })

} catch (err) {

await session.abortTransaction()

res.status(400).json({ message: err.message })

} finally {

session.endSession()

}

}

export const updateBookingSeats = async (req, res) => {

const session = await mongoose.startSession()
session.startTransaction()

try {

const { newSeats } = req.body

if (!newSeats?.length)
throw new Error("Seats required")

const booking = await Booking.findById(req.params.bookingId).session(session)

if (!booking)
throw new Error("Booking not found")

await Theatre.updateOne(
{ _id: booking.theatreId },
{ $pull: { bookedSeats: { $in: booking.seats } } },
{ session }
)

const updated = await Theatre.findOneAndUpdate(
{ _id: booking.theatreId, bookedSeats: { $nin: newSeats } },
{ $addToSet: { bookedSeats: { $each: newSeats } } },
{ session }
)

if (!updated)
throw new Error("Seats already booked")

booking.seats = newSeats

const movie = await Movie.findById(booking.movieId).session(session)
const theatre = await Theatre.findById(booking.theatreId).session(session)

const qr = await generateQR(booking, movie, theatre)

booking.qrCode = qr

await booking.save({ session })

await session.commitTransaction()

const populated = await Booking.findById(booking._id)
.populate("movieId")
.populate("theatreId")

res.json(populated)

} catch (err) {

await session.abortTransaction()

res.status(400).json({ message: err.message })

} finally {

session.endSession()

}

}
