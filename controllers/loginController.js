const loginController = async (req, res) => {
  const { email, pwd } = req.body;
  const user = await Details.findOne({ email });

  if (!user) {
    return res.json({ error: "User not found" });
  }

  if (await bcrypt.compare(pwd, user.pwd)) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET);

    // Check if the user has admin privileges based on certain criteria
    const isAdmin = checkAdminCriteria(user);

    if (res.status(201)) {
      return res.json({
        status: "ok",
        data: token,
        role: isAdmin ? "admin" : "user",
      });
    } else {
      return res.json({ error: "error" });
    }
  }

  res.json({ status: "error", error: "Invalid Password" });
};
module.exports = { loginController };
