const footer = require("../models/footerModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getFooterImages = catchAsync(async (req, res, next) => {
	const images = await footer.find();
	console.log(images);
	if (!images) return next(new AppError("There is no images found", 404));

	res.status(200).json({
		status: "success",
		images,
	});
});

exports.createNewFooterImage = catchAsync(async (req, res, next) => {
	const image = req.body;

	await footer.create(image);
	res.status(201).json({ status: "success" });
});

exports.deletetFooterImages = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	console.log(id);
	await footer.findByIdAndDelete(id);

	res.status(200).json({ status: "success" });
});