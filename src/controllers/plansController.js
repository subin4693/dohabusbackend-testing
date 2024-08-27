const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Plan = require('../models/planModel');

// Create a new plan
exports.createNewPlans = catchAsync(async (req, res, next) => {
    const {
        category, coverImage, title, duration, typeOfTour, transportation, language,
        description, highlights, includes, itinerary, knowBeforeYouGo, faq,
        galleryimages, galleryvideos, availableDays, sessions, adultPrice, childPrice, isActive
    } = req.body;

    // Check for missing required fields
    if (!category || !coverImage || !title || !duration || !typeOfTour || !transportation ||
        !language || !description || !highlights || !includes || !itinerary || !galleryimages ||
        !galleryvideos || !availableDays || !sessions || adultPrice === undefined || childPrice === undefined) {
        return next(new AppError("All fields are required to create a plan", 400));
    }

    // Create the plan
    const newPlan = await Plan.create({
        category,
        coverImage,
        title,
        duration,
        typeOfTour,
        transportation,
        language,
        description,
        highlights,
        includes,
        itinerary,
        knowBeforeYouGo,
        faq,
        galleryimages,
        galleryvideos,
        availableDays,
        sessions,
        adultPrice,
        childPrice,
        isActive
    });

    res.status(201).json({
        status: "success",
        data: {
            plan: newPlan
        }
    });
});

exports.getAllPlans = catchAsync(async (req, res, next) => {
    const plans = await Plan.find({ isActive: true });

    res.status(200).json({
        status: "success",
        results: plans.length,
        data: {
            plans
        }
    });
});

// Delete a plan by ID
exports.deletePlan = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const plan = await Plan.findByIdAndDelete(id);

    if (!plan) {
        return next(new AppError("No plan found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Plan deleted successfully",
        data: null
    });
});

// Update a plan by ID
exports.editPlan = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const {
        category, coverImage, title, duration, typeOfTour, transportation, language,
        description, highlights, includes, itinerary, knowBeforeYouGo, faq,
        galleryimages, galleryvideos, availableDays, sessions, adultPrice, childPrice, isActive
    } = req.body;

    // Check for missing required fields
    if (!category || !coverImage || !title || !duration || !typeOfTour || !transportation ||
        !language || !description || !highlights || !includes || !itinerary || !galleryimages ||
        !galleryvideos || !availableDays || !sessions || adultPrice === undefined || childPrice === undefined) {
        return next(new AppError("All fields are required to update a plan", 400));
    }

    // Update the plan
    const updatedPlan = await Plan.findByIdAndUpdate(
        id,
        {
            category,
            coverImage,
            title,
            duration,
            typeOfTour,
            transportation,
            language,
            description,
            highlights,
            includes,
            itinerary,
            knowBeforeYouGo,
            faq,
            galleryimages,
            galleryvideos,
            availableDays,
            sessions,
            adultPrice,
            childPrice,
            isActive
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedPlan) {
        return next(new AppError("No plan found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            plan: updatedPlan
        }
    });
});

// Get a single plan by ID
exports.getSinglePlan = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
        return next(new AppError("No plan found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    });
});

// Get plans by category ID
exports.getPlanByCategory = catchAsync(async (req, res, next) => {
    const { categoryId } = req.params;

    const plans = await Plan.find({ category: categoryId });

    if (!plans || plans.length === 0) {
        return next(new AppError("No plans found for this category", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            plans
        }
    });
});
