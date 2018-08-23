import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import { bcrypt, hashSync, compareSync } from 'bcrypt-nodejs';
import jwt from 'jsonwebtoken';
import uniqueValidator from 'mongoose-unique-validator';

import Post from '../posts/post.model';
import { passwordReg } from './user.validations';
import constants from '../../config/constants';

import security from '../../config/security';
import settings from '../../config/settings';
import DATABASE_COLLECTION from '../../config/datacollections';
import formatDateTime from '../../utils/formatDateTime';

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'UserName is required!'],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required!'],
      trim: true,
      //match: /(?=.*[a-zA-Z])(?=.*[0-9]+).*/,
      minlength: [6, 'Password need to be longer!'],
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: 'Customer',
    },
    cargroup_id: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: 'CarGroup',
    },
    phone: {
      type: String,
      required: [true, 'Phone is required!'],
      trim: true,
      validate: {
        validator: function (v) {
          var re = /^(\+84|0)(1(2[0-9]|6[2-9]|88)|8[689]|9[0-9])\d{7}$/;
          return (v == null || v.trim().length < 1) || re.test(v)
        },
        message: '{VALUE} Số điện thoại không hợp lệ!',
      },
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required!'],
      trim: true,
      validate: {
        validator(email) {
          return validator.isEmail(email);
        },
        message: '{VALUE} Email không hợp lệ!',
      },
    },
    fullname: {
      type: String,
      required: [true, 'FullName is required!'],
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
      default: 'https://www.biber.com/dta/themes/biber/core/assets/images/no-featured-175.jpg'
    },
    token_expire: {
      type: String,
      trim: true,
    },
    birthday: {
      type: String,
      trim: true,
      default: formatDateTime.localDate
    },
    sex: {
      type: String,
      trim: true,
      default: 'Nam'
    },
    face_id: {
      type: String,
      trim: true,
      default: 'face_id'
    },
    google_id: {
      type: String,
      trim: true,
      default: 'google_id'
    },
    created_date: {
      type: String,
      trim: true,
      default: formatDateTime.localDate
    },
    created_time: {
      type: String,
      trim: true,
      default: formatDateTime.localTime
    },
    update_date: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: [security.ROLE_CLIENT, security.ROLE_MANAGER, security.ROLE_ADMIN],
      default: security.ROLE_CLIENT
    },
    status: String, //ACTIVE, INACTIVE, SUSPENDED
    role_code: {
      type: String,
      trim: true,
      default: '2', //tài xế
    },
    token_expiresIn: {
      type: Number,
      trim: true,
      default: 3600
    },
    accountno: { type: String, default: '' },
    accountname: { type: String, default: '' },
    bankcode: { type: String, default: '' },
    bankname: { type: String, default: '' },
    branchname: { type: String, default: '' }
  },
  { timestamps: true },
);

UserSchema.plugin(uniqueValidator, {
  message: '{VALUE} đã tồn tại!',
});
UserSchema.pre('validate', function (req, res, next) {
  next();
});

UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = this._hashPassword(this.password);
  }

  return next();
});

UserSchema.methods = {
  comparePassword(password) {
    return compareSync(password, this.password);
  },
  _hashPassword(password) {
    return hashSync(password);
  },
  authenticateUser(password) {
    return compareSync(password, this.password);
  },
  createToken(expiry) {
    return jwt.sign(
      {
        _id: this._id
      },
      constants.JWT_SECRET,
      {
        expiresIn: expiry
      }
    );
  },
  toAuthJSON() {
    var expiresIn = this.token_expiresIn || 3600;
    var expiry = settings.tokenExpired * this.token_expiresIn;
    return {
      _id: this._id,
      username: this.username,
      access_token: `JWT ${this.createToken(expiry)}`,
      email: this.email,
      fullname: this.fullname,
      phone: this.phone,
      birthday: this.birthday,
      photo: this.photo,
      avatar: this.avatar,
      sex: this.sex,
      face_id: this.face_id,
      google_id: this.google_id,
      role: this.role,
      permissions: [],
      expires_in: settings.tokenExpired * this.token_expiresIn,
      token_expiresIn: this.token_expiresIn,
      status: this.status,
      role_code: this.role_code,
      customer_id: this.customer_id
    };
  },
  toJSON() {
    return {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullname: this.fullname,
      phone: this.phone,
      birthday: this.birthday,
      photo: this.photo,
      sex: this.sex,
      face_id: this.face_id,
      google_id: this.google_id,
      role: this.role,
      status: this.status,
      role_code: this.role_code,
      token_expiresIn: this.token_expiresIn,
      customer_id: this.customer_id,
      accountno: this.accountno,
      accountname: this.accountname,
      bankcode: this.bankcode,
      bankname: this.bankname,
      branchname: this.branchname
    };
  },
  isInActivated(checkStatus) {
    if (checkStatus === "INACTIVE") {
      return true;
    } else {
      return false;
    }
  },
  isSuspended(checkStatus) {
    if (checkStatus === "SUSPENDED") {
      return true;
    } else {
      return false;
    }
  },
};

UserSchema.statics = {
  list({ skip = 0, limit = 10 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },
}
export default mongoose.model('User', UserSchema, DATABASE_COLLECTION.USER_COLLECTION);
