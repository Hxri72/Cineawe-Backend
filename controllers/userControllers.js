const user = require("../models/userModel");
const theaterModel = require("../models/theaterModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodeMailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bookingModel = require("../models/bookingModel");
const movieModel = require("../models/movieModel");
const axios = require("axios");

module.exports = {
  getCurrentUser: async (req, res) => {
    try {
      const User = await user.findById(req.body.Id).select("-password");
      res.send({
        success: true,
        message: "User Details fetched successfully",
        data: User,
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  getShowDates: async (req, res) => {
    try {
      const today = new Date();

      const lastweekDates = [];
      for (let i = 0; i <= 6; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const formattedDate = `${day.toString().padStart(2, "0")}/${month
          .toString()
          .padStart(2, "0")}/${year}`;
        lastweekDates.push(formattedDate);
      }

      if (lastweekDates.length !== 0) {
        res.send({
          success: true,
          message: "Show date fetched successfully",
          data: lastweekDates,
        });
      } else {
        res.send({
          success: false,
          message: "Show date not fetched",
        });
      }
    } catch (error) {
      res.send({
        success: false,
        message: "Something went wrong",
      });
    }
  },

  postUserSignup: async (req, res, next) => {
    try {
      const userExist = await user.findOne({ email: req.body.email });
      if (userExist) {
        return res.send({
          success: false,
          message: "User already Exist",
        });
      }

      //hashing the password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashPassword;

      const newUser = new user(req.body);
      await newUser.save();

      res.send({
        success: true,
        message: "User created successfully",
      });
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  },

  postUserLogin: async (req, res, next) => {
    try {
      //check if user exist
      const userExist = await user.findOne({ email: req.body.email });

      if (!userExist) {
        return res.send({
          success: false,
          message: "User does not exist",
        });
      }

      if (userExist.isAdminBlocked === "true") {
        return res.send({
          success: false,
          message: "You are Blocked by Admin",
        });
      }

      //checking password
      const validPassword = await bcrypt.compare(
        req.body.password,
        userExist.password
      );

      if (!validPassword) {
        return res.send({
          success: false,
          message: "Password is incorrect",
        });
      }

      //create and assign to token
      const token = jwt.sign({ _id: userExist._id }, process.env.jwt_secret, {
        expiresIn: "1d",
      });
      const { password, ...others } = userExist._doc;

      res.send({
        success: true,
        message: " User logged in Successfully",
        data: token,
        userData: others,
      });
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  },

  postUserOtp: async (req, res, next) => {
    try {
      const otp = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      console.log(otp);

      const sender = nodeMailer.createTransport({
        service: "gmail",
        auth: {
          user: "hariprasad727272@gmail.com",
          pass: process.env.APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: "Cineawe",
        to: "hariprasad72172@gmail.com",
        subject: "Cineawe:- Verify with OTP",
        text: `OTP to verify : ${otp}`,
      };

      sender.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          res.send({
            success: true,
            message: "Email send successfully",
            data: otp,
          });
        }
      });
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  },

  postGetShows: async (req, res) => {
    try {
      const date = req.body.data.date;
      const movieName = req.body.data.movieName;

      let showData = await theaterModel.aggregate([
        {
          $match: {
            shows: {
              $elemMatch: {
                moviename: movieName,
                startdate: { $lte: date },
                enddate: { $gte: date },
              },
            },
          },
        },
        {
          $project: {
            theaterName: 1,
            shows: {
              $filter: {
                input: "$shows",
                as: "show",
                cond: {
                  $and: [
                    { $eq: ["$$show.moviename", movieName] },
                    { $lte: ["$$show.startdate", date] },
                    { $gte: ["$$show.enddate", date] },
                  ],
                },
              },
            },
          },
        },
      ]);

      const currentDay = new Date().toLocaleDateString();
      const [month, day, year] = currentDay.split("/"); // ["4", "9", "2023"]
      const monthFormatted = month.padStart(2, "0"); // "04"
      const dayFormatted = day.padStart(2, "0"); // "09"
      const currentDayFormatted = `${dayFormatted}/${monthFormatted}/${year}`; // "04/09/2023"

      if (date === currentDayFormatted) {
        const options = {
          timeZone: "Asia/Kolkata",
          hour12: true,
        };

        const currentTime = new Date().toLocaleString("en-US", options);
        const numTime = currentTime.slice(10, 15);
        const timeZone = currentTime.slice(19, 22);
        const currentTimeAccurate = `${numTime}` + " " + `${timeZone}`;

        const arr = [];

        for (let i = 0; i < showData.length; i++) {
          const shows = showData[i].shows;

          // Iterate through the shows array in each object
          for (let j = 0; j < shows.length; j++) {
            const showTime = shows[j].showtime;

            function convertTo24Hour(timeStr) {
              const [hours, minutes] = timeStr.split(":");
              const period = minutes.slice(3, 5);
              const minutesAg = minutes.slice(0, 3);
              let hours24 = parseInt(hours);
              if (period === "PM" && hours24 < 12) {
                hours24 += 12;
              } else if (period === "AM" && hours24 === 12) {
                hours24 = 0;
              }
              return `${hours24.toString().padStart(2, "0")}:${minutesAg}`;
            }

            const parseTime = (timeStr) => {
              const [hours, minutes] = timeStr.split(":");
              const period = minutes.slice(3, 5);
              const minutesAg = minutes.slice(0, 3);
              let totalMinutes =
                (parseInt(hours) % 12) * 60 + parseInt(minutesAg);
              if (hours > 12) {
                totalMinutes += 12 * 60;
              }
              return totalMinutes;
            };

            const aMinutes24 = convertTo24Hour(currentTimeAccurate);
            const bMinutes24 = convertTo24Hour(showTime);

            console.log(aMinutes24);
            console.log(bMinutes24);

            const aMinutes = parseTime(aMinutes24);
            const bMinutes = parseTime(bMinutes24);

            console.log(aMinutes + 30);
            console.log(bMinutes);

            // Check if the show time is after the current time

            if (aMinutes < bMinutes) {
              const searchResult = arr.find(
                (data) => data.theaterName === shows[j].theatername
              );
              if (searchResult) {
                searchResult.shows.push(shows[j]);
              } else {
                const newDoc = {
                  theaterName: shows[j].theatername,
                  shows: [shows[j]],
                };
                arr.push(newDoc);
              }
            }
          }
        }

        res.send({
          success: true,
          message: "Show date fetched successfully",
          data: arr,
        });
      } else {
        res.send({
          success: true,
          message: "Show date fetched successfully",
          data: showData,
        });
      }
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  },

  getTheater: async (req, res, next) => {
    try {
      const theaterName = req.body.theaterName;
      const theater = await theaterModel.find({ theaterName: theaterName });
      if (theater) {
        res.send({
          success: true,
          message: "Theater Details Fetched successfully",
          data: theater,
        });
      } else {
        res.send({
          success: false,
          message: "Theater details not fetched",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  getCreateOrder: async (req, res) => {
    try {
      const amount = req.body.amount;
      var instance = new Razorpay({
        key_id: process.env.Razorpay_KEY_ID,
        key_secret: process.env.Razorpay_Secret,
      });
      const options = {
        amount: amount * 100,
        currency: "INR",
      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
          res.status(500).send("Something went wrong");
        }
        res.json(order);
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  postVerifyPayment: async (req, res, next) => {
    try {
      const paymentDetails = req.body;
      const paymentData = paymentDetails.paymentData;

      const userDetails = paymentData.user;
      const contactMail = paymentData.email;
      const contactPhone = paymentData.phone;
      const showData = paymentData.showData;
      const selectedSeats = paymentData.selectedSeats;
      const showDate = paymentData.showDate;
      const price = paymentData.price;
      const showId = showData._id;

      const theater = await theaterModel.find({
        theaterName: showData.theatername,
      });
      const ownerMail = theater[0].ownerEmail;

      const subTotal = selectedSeats.length * showData.ticketprice;

      let hmac = crypto.createHmac("sha256", process.env.Razorpay_Secret);
      hmac.update(
        paymentDetails.payment.razorpay_order_id +
          "|" +
          paymentDetails.payment.razorpay_payment_id
      );
      hmac = hmac.digest("hex");

      if (hmac === paymentDetails.payment.razorpay_signature) {
        await bookingModel.insertMany({
          user: userDetails.firstname,
          userMail: userDetails.email,
          contactMail: contactMail,
          ownerMail: ownerMail,
          contactPhone: contactPhone,
          theaterName: showData.theatername,
          movieName: showData.moviename,
          showId: showId,
          showDate: showDate,
          showTime: showData.showtime,
          subTotal: subTotal,
          totalPrice: price,
          selectedSeats: selectedSeats,
        });

        await theaterModel.updateOne(
          {
            theaterName: showData.theatername,
            "shows._id": showId,
            "shows.dates.date": showDate,
            "shows.dates.seats.id": {
              $in: selectedSeats.map((seat) => seat.id),
            },
          },
          {
            $set: {
              "shows.$[show].dates.$[date].seats.$[seat].seatStatus": "sold",
            },
          },
          {
            arrayFilters: [
              { "show._id": showId },
              { "date.date": showDate },
              { "seat.id": { $in: selectedSeats.map((seat) => seat.id) } },
            ],
          }
        );

        res.send({
          success: true,
          message: "verification complete",
        });
      } else {
        res.send({
          success: false,
          message: "something went wrong",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  getTickets: async (req, res, next) => {
    try {
      const userMail = req.body.userMail;
      const bookingData = await bookingModel.aggregate([
        {
          $match: {
            userMail: userMail,
          },
        },
      ]);

      res.send({
        success: true,
        message: "bookingData fetched successfully",
        data: bookingData,
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  postCancelBooking: async (req, res, next) => {
    try {
      const bookingId = req.body.bookingId;
      const showId = req.body.showId;
      const selectedSeats = req.body.selectedSeats;
      const theaterName = req.body.theaterName;
      const showDate = req.body.showDate;

      await bookingModel.deleteOne({ _id: bookingId });
      const response = await bookingModel.find({});

      const updation = await theaterModel.updateOne(
        {
          theaterName: theaterName,
          "shows._id": showId,
          "shows.dates.date": showDate,
          "shows.dates.seats.id": { $in: selectedSeats.map((seat) => seat.id) },
        },
        {
          $set: {
            "shows.$[show].dates.$[date].seats.$[seat].seatStatus": "available",
          },
        },
        {
          arrayFilters: [
            { "show._id": showId },
            { "date.date": showDate },
            { "seat.id": { $in: selectedSeats.map((seat) => seat.id) } },
          ],
        }
      );

      console.log(updation);

      res.send({
        success: true,
        message: "booking cancelled",
        data: response,
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  postGetSeats: async (req, res, next) => {
    try {
      const dates = req.body.Dates;
      const selectedDate = req.body.date;

      const matchedDate = dates.find((obj) => obj.date === selectedDate);

      if (matchedDate) {
        const seats = matchedDate.seats;

        res.send({
          success: true,
          message: "seats fetched successfully",
          data: seats,
        });
      } else {
        res.send({
          success: false,
          message: "seats not fetched",
        });
      }
    } catch (error) {
      res.send({
        success: false,
        message: "The seatsData is not fetched",
      });
    }
  },
  getAllMovies: async (req, res, next) => {
    try {
      const Movies = await movieModel.find({});
      const englishMovies = Movies[0].englishMovies;
      const malayalamMovies = Movies[0].malayalamMovies;
      const tamilMovies = Movies[0].tamilMovies;

      const englishMoviesTmdb = [];

      for (const movieTitle of englishMovies) {
        const movieName = movieTitle.movieName;
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${movieName}`
        );
        englishMoviesTmdb.push(response.data.results[0]);
      }

      const malayalamMoviesTmdb = [];

      for (const movieTitle of malayalamMovies) {
        const movieName = movieTitle.movieName;
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${movieName}`
        );
        malayalamMoviesTmdb.push(response.data.results[0]);
      }

      const tamilMoviesTmdb = [];

      for (const movieTitle of tamilMovies) {
        const movieName = movieTitle.movieName;
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${movieName}`
        );
        tamilMoviesTmdb.push(response.data.results[0]);
      }

      const data = {
        englishMovies: englishMoviesTmdb,
        malayalamMovies: malayalamMoviesTmdb,
        tamilMovies: tamilMoviesTmdb,
      };

      res.send({
        success: true,
        message: "data fetched successfully",
        data: data,
      });
    } catch (error) {
      return res.send({
        success: false,
        message: "Something went wrong",
      });
    }
  },
};
