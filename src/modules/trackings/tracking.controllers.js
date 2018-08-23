import HTTPStatus from 'http-status';
import mongoose, { Schema } from 'mongoose';
import Tracking from './tracking.model';
import Campaign from '../campaigns/campaign.model';
import Car from '../cars/car.model';
import successCode from '../../utils/successCode';
var moment = require('moment-timezone');
const unirest = require('unirest'); //get
var _ = require('lodash');

export async function create(req, res) {
  let appData = {};
  try {
    // var objtracking = new Tracking();
    // objtracking.car_id = req.body.car_id;
    // objtracking.device_id = req.body.device_id;
    // objtracking.location_lat = req.body.location_lat;
    // objtracking.location_long = req.body.location_long;
    // objtracking.type = req.body.type;
    // objtracking.district_code = req.body.district_code;
    // objtracking.district_name = req.body.district_name;
    var objTracking = {};
    Object.keys(req.body).forEach(key => {
      objTracking[key] = req.body[key];
    });

    // let tracking = new Tracking(objTracking);
    let tracking = await Tracking.create(objTracking);
    appData['success'] = successCode.success1;
    appData['data'] = tracking;
    appData['status'] = HTTPStatus.CREATED;
    return res.status(HTTPStatus.CREATED).json(appData);
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    if (err.name === 'MongoError' && err.code === 11000) {
      appData['data'] = err.message;
    } else {
      appData['data'] = 'Có lỗi xảy ra trong khi tạo mới ' + err;
    }
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
}

/**begin tìm tất cả */
export async function findAll(req, res) {
  let appData = {};
  try {
    let tracking = await Tracking.find();
    if (!tracking) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = tracking;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 'Có lỗi trong khi nhận dữ liệu ' + err;
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};

// get a list of tracking from the db
export async function findGeo(req, res, next) {
  // var query = Building.collection.geoNear
  // (parseFloat(req.params.longitude),
  // parseFloat(req.params.latitude),

  // { distance: parseFloat(req.params.distance) / 3963.192}, function (error, docs)
  Tracking.geoNear(
    { type: 'Point', coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)] },
    { minDistance: 0, spherical: true }
  ).then(function (trackings) {
    res.send(trackings);
  }).catch(next);
};



/**begin tìm tất cả tracking từ ngày đến ngày */
export async function findAllRankDate(req, res) {
  let appData = {};
  try {
    var query = {};
    var fromDate = moment(req.query.startDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var endDate = moment(req.query.endDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var fromDate = moment(fromDate).format('YYYY-MM-DD');
    var toDate = moment(endDate).format('YYYY-MM-DD');
    query.created_date = { $gte: fromDate, $lte: toDate };
    query.device_id = req.query.device_id;
    var sort = [["created_date", 1], ["created_time", 1]];
    let trackings = await Tracking.find(query).sort(sort)
    if (!trackings) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var coordinates = [];
      trackings.forEach(function (tracking) {
        var element = {};
        element.lng = parseFloat(tracking.location_long);
        element.lat = parseFloat(tracking.location_lat);
        coordinates.push(element);
      });
      appData['success'] = successCode.success1;
      appData['data'] = coordinates;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.INTERNAL_SERVER_ERROR;
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(appData);
  }
};
/**end tìm tất cả paging*/

//lấy tất cả vị trí xe hiện tại
export async function getvehiclestatuses(req, res) {
  let appData = {};
  let danhsach = [];
  let danhsachtong = [];
  try {
      unirest.get("https://client-api.quanlyxe.vn/v3/tracking/getvehiclestatuses?id=0&ticks=0&apikey=af0792a100734217c2694e960bad83da")
      .strictSSL(false)
      .end(function (response) {
        if (response.error) {
          danhsach = [];
        } else {
          var result = JSON.parse(JSON.stringify(response.body));
          danhsach = result.Data;
        }
      });
      //  push them ben caradd vao
      unirest.get("http://gpsthk.net/apim/tracking/getlivetrack?username=nextmarketing&password=123@")
      .strictSSL(false)
      .end(function (response) {
        if (response.error) {
        } else {
            var result = JSON.parse(JSON.stringify(response.body));
            var resultData = result.data;            
            resultData.forEach(carad => {
              var element = {};
              element.Id = parseInt(carad.Id);
              element.Speed = carad.Speed;
              element.X = parseFloat(carad.y);
              element.Y = parseFloat(carad.x);
              var status = carad.Status.trim();              
              element.Heading=0;
              element.Address= carad.Address;
              element.Sensors= [];
              element.Distance=  carad.Distances;
              element.Status = (status == "Chạy" ? 1 : 0);
              danhsach.push(element);
              //console.log('danhsach', danhsach.length);
            });
            // console.log('danhsach', danhsach);
            appData['success'] = successCode.success1;
            appData['data'] = danhsach; //data viết hoa vietmap
            appData['status'] = HTTPStatus.OK;
            return res.status(HTTPStatus.OK).json(appData);
        }        
      });
      

  } catch (error) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    return res.status(HTTPStatus.OK).json(appData);
  }
}

//lấy vị trí của 1 xe hiện tại
export async function getvehiclestatuses_One(req, res) {
  let appData = {};
  try {
    var device_id = req.query.device_id;
    unirest.get("https://client-api.quanlyxe.vn/v3/tracking/getvehiclestatuses?id=" + device_id + "&ticks=0&apikey=af0792a100734217c2694e960bad83da")
      .strictSSL(false)
      .end(function (response) {
        if (response.error) {
          appData['success'] = successCode.success0;
          appData['data'] = [];
          appData['status'] = HTTPStatus.OK;
          return res.status(HTTPStatus.OK).json(appData);
        } else {
          var result = JSON.parse(JSON.stringify(response.body));
          appData['success'] = successCode.success1;
          appData['data'] = result.Data; //data viết hoa vietmap
          appData['status'] = HTTPStatus.OK;
          return res.status(HTTPStatus.OK).json(appData);
        }
      });
  } catch (error) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    return res.status(HTTPStatus.OK).json(appData);
  }
}

/** Lấy danh sách tất cả xe đang chạy cho 1 hợp đồng và thống kê km chạy dc trong tracking */
export async function getListCarByCampaignID(req, res) {
  let appData = {};
  try {
    var fromDate = moment(req.query.startDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var endDate = moment(req.query.endDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var from_Date = moment(fromDate).format('YYYY-MM-DD');
    var to_Date = moment(endDate).format('YYYY-MM-DD');
    var campaign_id = req.params.id;
    //lấy ds xe theo hợp đồng
    let campaign = await Campaign.findById(campaign_id).select({ 'cars': 1 })
      .populate([
        {
          path: 'cars',
          select: "_id device_id license_plate car_manufacturer car_color active status",
          populate: {
            path: 'user_id',
            select: 'fullname phone',
          }
        }
      ]);
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var carsSearch = [];
      var resultDrivers = [];
      campaign.cars.forEach(function (r) {
        carsSearch.push(r.device_id);
        //lấy ds thông tin tài xế để compare với ds deviceId khi tracking
        var element = {};
        element.fullname = r.user_id.fullname;
        element.phone = r.user_id.phone;
        element.device_id = r.device_id;
        element.license_plate = r.license_plate;
        element.car_manufacturer = r.car_manufacturer;
        element.car_color = r.car_color;
        element.status = r.status;
        element.totalDistance = 0;
        resultDrivers.push(element);
      });
      var sort = [["device_id", 1], ["created_date", 1], ["created_time", 1]];

      //tìm trong tracking ds xe theo hợp đồng
      let tracking = await Tracking.aggregate([
        { $match: { $and: [{ created_date: { $gte: from_Date, $lte: to_Date } }, { device_id: { $in: carsSearch } }] } },
        {
          "$group":
            {
              "_id":
                {
                  "device_id": "$device_id",
                  "created_date": "$created_date"
                },
              "totalDistance":
                {
                  "$max": { "$ifNull": ["$distance", 0] }
                }
            }
        },
        {
          "$group":
            {
              "_id":
                {
                  "device_id": "$_id.device_id",
                },
              "totalDistance":
                {
                  "$sum": "$totalDistance"
                }
            }
        },
      ]);
      if (!tracking) {
        appData['success'] = successCode.success0;
        appData['data'] = [];
        appData['status'] = HTTPStatus.NOT_FOUND;
        res.status(HTTPStatus.NOT_FOUND).json(appData);
      } else {
        var trackingConvert = [];
        tracking.forEach(function (t) {
          var elm = {};
          elm.device_id = t._id.device_id;
          elm.totalDistance = parseFloat(t.totalDistance);
          trackingConvert.push(elm);
        });

        //cách 1: gộp 2 list với nhau để lấy những thằng ko có tracking cũng hiển thị km = 0  ra luôn.
        let listResult = [];
        listResult = _.map(resultDrivers, function (item) {
          return _.merge(item, _.find(trackingConvert, { 'device_id': item.device_id }));
        });

        //cách 2: chỉ lấy những thằng có tracking ra thôi
        // var listResult = _.map(trackingConvert, function (item) {
        //   if (_.findIndex(resultDrivers, { device_id: item.device_id }) !== -1) {
        //     return _.assign(
        //       _.pick(_.find(resultDrivers, { device_id: item.device_id }), 'device_id', 'fullname', 'phone', 'license_plate', 'car_manufacturer', 'car_color', 'status'),
        //       item
        //     );
        //   }
        // });
        appData['success'] = successCode.success1;
        appData['data'] = listResult;
        appData['status'] = HTTPStatus.OK;
        res.status(HTTPStatus.OK).json(appData);
      }
    }
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json('Có lỗi trong khi nhận dữ liệu ' + err);
  }
};
/** End Tìm theo id*/
export function flexFilter(info) {
  var matchesFilter, matches = [], count = 0;
  matchesFilter = function (item) {
    for (var n = 0; n < info.length; n++) {
      if (info[n]["Values"].indexOf(item[info[n]["Field"]]) > -1) {
        count++;
      }
    }
    return count == info.length;
  }

  // Loop through each item in the array
  for (var i = 0; i < this.length; i++) {
    // Determine if the current item matches the filter criteria
    if (matchesFilter(this[i])) {
      matches.push(this[i]);
    }
  }
  // Give us a new array containing the objects matching the filter criteria
  return matches;
}

/** Lấy tất cả hợp đồng của 1 KH dashboard */
export async function getCampaignByCustomerID(req, res) {
  let appData = {};
  try {
    var customer_id = req.user.customer_id;
    var criteria = {};
    criteria.customer_id = mongoose.Types.ObjectId(customer_id);
    let campaign = await Campaign.aggregate([
      { $match: criteria },
      { $lookup: { from: "area", localField: "area_code", foreignField: "code", as: "area" } },
      { $unwind: "$area" },
      {
        $lookup: {
          from: "car",
          localField: "cars",
          foreignField: "_id",
          as: "cars"
        }
      },
      {
        $project:
          {
            "areaCode": "$area.code",
            "areaName": "$area.name",
            "_id": 0,
            "name": 1,
            "total_car": 1,
            "impressionNo": 1,
            "start_time": 1,
            "end_time": 1,
            "status": 1,
            "cars": 1,
            "location_lat": 1,
            "location_lng": 1,
          }
      }
    ]);
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var Campain_Cars = [];

      campaign.forEach(function (camp) {
        var element = {};
        element._id = camp._id;
        element.name = camp.name;
        element.areacode = camp.areaCode;
        element.areaname = camp.areaName;
        element.end_time = camp.end_time;
        element.start_time = camp.start_time;
        element.status = camp.status;
        element.total_car = camp.total_car;
        element.impressionNo = camp.impressionNo || 1;
        element.location_lat = camp.location_lat || 10.776666;
        element.location_lng = camp.location_lng || 106.680387;
        var cars = []; //fai bỏ trong này mới đúng
        camp.cars.forEach(function (r) {
          cars.push(r.device_id);
        });
        element.cars = cars;
        Campain_Cars.push(element);
      });
      appData['success'] = successCode.success1;
      appData['data'] = Campain_Cars;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** End Tìm theo tháng*/

/** Lấy danh sách tất cả xe đang chạy cho 1 hợp đồng và thống kê km chạy dc trong tháng */
export async function getListCarByCampaignIDMonth(req, res) {
  let appData = {};
  try {
    var fromDate = moment(req.query.startDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var endDate = moment(req.query.endDate, ["DD/MM/YYYY", "YYYY-MM-DD"]);
    var from_Date = moment(fromDate).format('YYYY-MM-DD');
    var to_Date = moment(endDate).format('YYYY-MM-DD');
    var campaign_id = req.params.id;
    //lấy ds xe theo hợp đồng
    let campaign = await Campaign.findById(campaign_id).select({ 'cars': 1 })
      .populate({
        path: 'cars',
        select: { 'device_id': 1 }
      });
    if (!campaign) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var cars = [];
      campaign.cars.forEach(function (r) {
        cars.push(r.device_id);
      });
      var sort = [["device_id", 1], ["created_date", 1], ["created_time", 1]];
      //tìm trong tracking ds xe theo hợp đồng
      let trackings = await Tracking.aggregate([
        { $match: { $and: [{ created_date: { $gte: from_Date, $lte: to_Date } }, { device_id: { $in: cars } }] } },
        {
          "$group":
            {
              "_id":
                {
                  "device_id": "$device_id",
                  "created_date": "$created_date"
                },
              "totalDistance":
                {
                  "$max": { "$ifNull": ["$distance", 0] }
                }
            }
        },
        {
          "$project": {
            "totalDistance": 1,
            "_id.created_date": 1,
          }
        }
      ]);
      if (!trackings) {
        appData['success'] = successCode.success0;
        appData['data'] = 0;
        appData['status'] = HTTPStatus.NOT_FOUND;
        res.status(HTTPStatus.NOT_FOUND).json(appData);
      } else {
        var totalDistance = 0;
        trackings.forEach(function (tracking) {
          totalDistance += parseFloat(tracking.totalDistance);
        });
        appData['success'] = successCode.success1;
        appData['data'] = totalDistance;
        appData['status'] = HTTPStatus.OK;
        res.status(HTTPStatus.OK).json(appData);
      }
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = 0;
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** End Tìm theo tháng*/

/** Thống kế dashboard tổng km, tổng tài xế (chưa sd vì sử dụng chung api ở dưới rồi)*/
export async function getChartbyDeviceIds(req, res) {
  let appData = {};
  try {
    let deviceIds = req.body.deviceIds;
    var impressionNo = req.body.impressionNo || 75; //măc dinh là 75 nếu ko có
    //tìm trong tracking ds xe theo hợp đồng
    let trackings = await Tracking.aggregate([
      { $match: { device_id: { $in: deviceIds } } },
      {
        "$group":
          {
            "_id":
              {
                "device_id": "$device_id",
                "created_date": "$created_date"
              },
            "totalDistance":
              {
                "$max": { "$ifNull": ["$distance", 0] }
              }
          }
      },
      {
        "$project": {
          "totalDistance": 1,
          "_id.created_date": 1,
        }
      }
    ]);
    if (!trackings) {
      appData['success'] = successCode.success0;
      appData['data'] = 0;
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var totalDistance = 0;
      trackings.forEach(function (tracking) {
        totalDistance += parseFloat(tracking.totalDistance);
      });
      //totalDistance: mét, totalImpression: km
      var data = {
        totalDistance: totalDistance,
        totalImpression: impressionNo * (totalDistance / 1000)
      }
      appData['success'] = successCode.success1;
      appData['data'] = data;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = {};
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** End Tìm theo tháng*/

/** Thống kế dashboard 20 tài xế chạy nhiều nhất của 1 hợp đồng tính theo impression*/
export async function getChartbyDeviceIds_Max20(req, res) {
  let appData = {};
  try {
    let deviceIds = req.body.deviceIds;
    var impressionNo = req.body.impressionNo || 75; //măc dinh là 75 nếu ko có
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    //tìm trong tracking ds xe theo hợp đồng
    let trackings = await Tracking.aggregate([
      { $match: { $and: [{ created_date: { $gte: start_time, $lte:  end_time } }, { device_id: { "$in":  deviceIds } }] } },
      // { $match: { device_id: { "$in": deviceIds } } },
      {
        "$group":
          {
            "_id":
              {
                "device_id": "$device_id",
                "created_date": "$created_date"
              },
            "totalDistance":
              {
                "$max": { "$ifNull": ["$distance", 0] }
              }
          }
      },
      {
        "$lookup": {
          "localField": "_id.device_id",
          "from": "car",
          "foreignField": "device_id",
          "as": "carinfo"
        }
      },
      { "$unwind": "$carinfo" },
      {
        "$lookup": {
          "localField": "carinfo.user_id",
          "from": "user",
          "foreignField": "_id",
          "as": "caruser"
        }
      },
      { "$unwind": "$caruser" },
      {
        "$group":
          {
            "_id":
              {
                "device_id": "$carinfo.device_id",
                "fullname": "$caruser.fullname"
              },
            "totalDistance":
              {
                "$sum": "$totalDistance"
              }
          }
      },
      { "$sort": { 'totalDistance': -1 } }
    ]);
    //sắp xếp km lơn nhất giảm dần để lấy top 20 tài xế ở client data.slice(0, 20);
    if (!trackings) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var data = [];
      trackings.forEach(function (tracking) {
        var element = {};
        element.fullname = tracking._id.fullname;
        element.totalDistance = (parseFloat(tracking.totalDistance) / 1000);
        element.totalImpression = impressionNo * (parseFloat(tracking.totalDistance) / 1000);
        data.push(element);
      });
      appData['success'] = successCode.success1;
      appData['data'] = data;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    console.log(err);
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** End Tìm theo tháng*/

/** Thống kế dashboard 20 tài xế chạy nhiều nhất của 1 hợp đồng tính theo impression*/
export async function getPieChartbyDeviceIds_Max10(req, res) {
  let appData = {};
  try {
    let deviceIds = req.body.deviceIds;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    //tìm trong tracking ds xe theo hợp đồng và group theo quận, order by count lớn nhất giảm dần
    let trackings = await Tracking.aggregate([
      { $match: { $and: [{ created_date: { $gte: start_time, $lte:  end_time } }, { device_id: { "$in":  deviceIds } },{'district_name': {$gt:''}}] } },
      { $group: { _id: "$district_name", count: { $sum: 1 } } },
      { $sort: { "count": -1 } }
    ]);
    //sắp xếp km lơn nhất giảm dần để lấy top 20 tài xế ở client data.slice(0, 20);
    if (!trackings) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var data = [];
      const remainDistricts = trackings.slice(0);
      const top10Districts = remainDistricts.splice(0, 10);
      // tính total
      var total_point = 0;
      trackings.forEach(function (d) {  
        total_point += d.count;
      });
      //console.log('totalpoint:' + total_point );
      top10Districts.forEach(function (d) {
        var element = {};
        element.label = d._id;
        // chỉnh lại ở đây --> thay vì count thi thay là tính phần trăm
        element.data = (d.count/total_point)*100;
        data.push(element);
      });

      if (remainDistricts && remainDistricts.length > 0) {
        const remainDistrictsTotal = remainDistricts.reduce(function (sum, d) {
          return sum + d.count;
        }, 0);
        var element = {};
        element.label = 'Các quận/huyện khác';
        element.data = (remainDistrictsTotal/total_point)*100; ;
        data.push(element);
      }
      appData['success'] = successCode.success1;
      appData['data'] = data;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    console.log(err);
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** End*/

/** Lấy danh sách tất cả xe không có trong bảng tracking */
export async function getListCarNotInTracking(req, res) {
  let appData = {};
  try {
    let tracking = await Tracking.aggregate([
      { "$group": { _id: "$device_id", count: { $sum: 1 } } },
      { $sort: { "_id.device_id": 1 } }
    ]);
    if (!tracking) {
      appData['success'] = successCode.success0;
      appData['data'] = 'Không tìm thấy dữ liệu';
      appData['status'] = HTTPStatus.NOT_FOUND;
      res.status(HTTPStatus.NOT_FOUND).json(appData);
    } else {
      var cars = [];
      tracking.forEach(function (r) {
        cars.push(r._id);
      });
      let responsecars = await Car.find({
        "device_id": {
          "$nin": cars
        }
      }).select({ 'device_id': 1 }).sort({ 'device_id': 1 });

      var cardelete = [];
      responsecars.forEach(function (r) {
        cardelete.push(r.device_id);
      });
      let car = await Car.remove({
        "device_id": {
          "$in": cardelete
        }
      });
      return res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json('Có lỗi trong khi nhận dữ liệu ' + err);
  }
};
/** End Tìm theo id*/


/** Lấy danh sách points dùng cho heatmap */
export async function getPointsHeatMap(req, res) {
  let appData = {};
  try {
    var objSearch = {};
    Object.keys(req.body).forEach(key => {
      objSearch[key] = req.body[key];
    });
    let trackings = await Tracking.aggregate([
      { "$match": { "$and": [{ "created_date": { "$gte": objSearch.startDate, "$lte":  objSearch.endDate } }, { "device_id": { "$in":  objSearch.deviceIds } }] } },
      { "$limit" : 100000 },
      {
        "$project": {
          "_id": 0,
          "location_lat": 1,
          "location_long": 1,
        }
      }
    ]);
    if (!trackings) {
      appData['success'] = successCode.success0;
      appData['data'] = [];
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    } else {
      appData['success'] = successCode.success1;
      appData['data'] = trackings;
      appData['status'] = HTTPStatus.OK;
      res.status(HTTPStatus.OK).json(appData);
    }
  } catch (err) {
    appData['success'] = successCode.success0;
    appData['data'] = [];
    appData['status'] = HTTPStatus.OK;
    res.status(HTTPStatus.OK).json(appData);
  }
};
/** End Tìm theo tháng*/
