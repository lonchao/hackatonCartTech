class ReaderController {
  async read(req, res) {
    // const { folder } = req.body;
    // if (await User.findOne({ email })) {
    //   return res.status(400).json({ error: 'User alredy exists' });
    // }
    // const user = await User.create(req.body);
    return res.json({ status: 'success' });
  }
}

module.exports = new ReaderController();
