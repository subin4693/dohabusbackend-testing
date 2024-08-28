const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const Plan = require("../models/planModel");
const AppError = require("../utils/appError");
const Cart = require("../models/cartModel");
const catchAsync = require("../utils/catchAsync");
const Favourite = require("../models/favouritesModel");

exports.getSummary = catchAsync(async (req, res, next) => {
  const usersCount = await User.countDocuments();

  const toursCount = await Plan.countDocuments();

  const totalBookings = await Ticket.countDocuments();

  const activeTickets = await Ticket.countDocuments({ status: "Booked" });

  res.status(200).json({
    status: "success",
    data: {
      users: usersCount,
      tours: toursCount,
      totalBookings: totalBookings,
      activeTickets: activeTickets,
    },
  });
});

exports.getMonthlySummary = catchAsync(async (req, res, next) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = new Date().getFullYear();

  const monthlyData = months.map((month) => ({
    name: month,
    ticketCount: 0,
    userCount: 0,
  }));

  const tickets = await Ticket.aggregate([
    {
      $match: {
        dates: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    },
    {
      $project: {
        month: { $month: "$dates" },
      },
    },
    {
      $group: {
        _id: "$month",
        ticketCount: { $sum: 1 },
      },
    },
  ]);

  const users = await User.aggregate([
    {
      $project: {
        month: { $month: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$month",
        userCount: { $sum: 1 },
      },
    },
  ]);

  tickets.forEach((ticket) => {
    const monthIndex = ticket._id - 1;
    if (monthlyData[monthIndex]) {
      monthlyData[monthIndex].ticketCount = ticket.ticketCount;
    }
  });

  users.forEach((user) => {
    const monthIndex = user._id - 1;
    if (monthlyData[monthIndex]) {
      monthlyData[monthIndex].userCount = user.userCount;
    }
  });

  res.status(200).json({
    status: "success",
    data: monthlyData,
  });
});

exports.getPieChartData = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.aggregate([
    {
      $group: {
        _id: "$plan",
        ticketCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "_id",
        foreignField: "_id",
        as: "planDetails",
      },
    },
    {
      $unwind: "$planDetails",
    },
    {
      $project: {
        _id: 0,
        name: "$planDetails.title",
        value: "$ticketCount",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: tickets,
  });
});

exports.getCarts = catchAsync(async (req, res, next) => {
  const carts = await Cart.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: {
        path: "$categoryDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "tour",
        foreignField: "_id",
        as: "planDetails",
      },
    },
    {
      $unwind: {
        path: "$planDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        tourName: "$planDetails.title",
        categoryName: "$categoryDetails.name",
        username: "$userDetails.name",
        userEmail: "$userDetails.email",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: carts.length,
    data: {
      carts,
    },
  });
});

exports.getFavourites = catchAsync(async (req, res, next) => {
  const favourites = await Favourite.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: {
        path: "$categoryDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "tour",
        foreignField: "_id",
        as: "planDetails",
      },
    },
    {
      $unwind: {
        path: "$planDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        tourName: "$planDetails.title",
        favouritesName: "$categoryDetails.name",
        username: "$userDetails.name",
        userEmail: "$userDetails.email",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: favourites.length,
    data: {
      favourites,
    },
  });
});

exports.getPlans = catchAsync(async (req, res, next) => {
  const plans = await Plan.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails",
    },
    {
      $project: {
        _id: 1,
        coverImage: 1,
        title: 1,
        description: 1,
        isActive: 1, // Include the isActive field from the plans model
        "categoryDetails._id": 1,
        "categoryDetails.title": 1,
        "categoryDetails.description": 1,
        "categoryDetails.coverImage": 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: plans.length,
    data: plans,
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  console.log("user", req.user);
  const users = await User.find().select("name email role");

  res.status(200).json({
    status: "success",
    data: users,
  });
});

exports.promoteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  console.log("userId", userId);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.role = "admin";
  await user.save();

  res.status(200).json({ message: "User promoted successfully", user });
});

exports.demoteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  console.log(userId);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.role = "user";
  await user.save();

  res.status(200).json({ message: "User demoted successfully", user });
});

exports.getTickets = catchAsync(async (req, res, next) => {
  try {
    // Get today's date in ISO format without the time portion
    const today = new Date().setHours(0, 0, 0, 0);

    // Aggregation pipeline to join tickets with users, plans, and categories
    const tickets = await Ticket.aggregate([
      {
        $match: {
          date: { $gte: new Date(today) }, // Only include tickets with date >= today
        },
      },
      {
        $lookup: {
          from: "plans", // Join with plans collection
          localField: "plan",
          foreignField: "_id",
          as: "planDetails",
        },
      },
      {
        $unwind: "$planDetails", // Deconstruct array field planDetails
      },
      {
        $lookup: {
          from: "users", // Join with users collection
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Deconstruct array field userDetails
      },
      {
        $lookup: {
          from: "categories", // Join with categories collection
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails", // Deconstruct array field categoryDetails
      },
      {
        $project: {
          _id: 1, // Include the ticket ID
          "plan.coverImage": "$planDetails.coverImage",
          "plan.title": "$planDetails.title",
          "plan.description": "$planDetails.description",
          "user.name": "$userDetails.name",
          "user.email": "$userDetails.email",
          "category.title": "$categoryDetails.title", // Include category title
          totalPrice: "$price",
          adultQuantity: "$adultQuantity",
          childQuantity: "$childQuantity",
          status: 1, // Include the ticket status
        },
      },
    ]);

    // Send the formatted response
    res.status(200).json({
      status: "success",
      data: tickets,
    });
  } catch (err) {
    console.error("Error:", err);
    return next(new AppError("Internal Server Error", 500));
  }
});

exports.cancelTicket = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the ticket by its ID
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    // Update the ticket status to "Canceled"
    ticket.status = "Canceled";
    await ticket.save();

    res.status(200).json({
      status: "success",
      data: {
        ticket,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return next(new AppError("Internal Server Error", 500));
  }
});
