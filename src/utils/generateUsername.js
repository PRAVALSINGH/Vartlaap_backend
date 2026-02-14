import User from "../modules/user/user.model.js";

export const generateUniqueUsername = async (base) => {
  let username = base.toLowerCase().replace(/\s+/g, "");
  let exists = await User.findOne({ username });

  let counter = 1;
  while (exists) {
    username = `${base}${counter}`;
    exists = await User.findOne({ username });
    counter++;
  }

  return username;
};
