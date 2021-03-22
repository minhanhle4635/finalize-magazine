const RequestLog = require('./models/requestLog');

module.exports = {
    getAnalytics() {
        let getTotalRequests = RequestLog.count()
        let getStatsPerRoute = RequestLog.aggregate([
            {
                $group: {
                    _id: { url: '$url', method: '$method' },
                    responseTime: { $avg: '$response_time' },
                    numberOfRequests: { $sum: 1 },
                }
            }
        ]);

        let getRequestsPerDay = RequestLog.aggregate([
            {
                $group: {
                    _id: '$day',
                    numberOfRequests: { $sum: 1 }
                }
            },
            { $sort: { numberOfRequests: 1 } }
        ]);

        let getRequestsPerHour = RequestLog.aggregate([
            {
                $group: {
                    _id: '$hour',
                    numberOfRequests: { $sum: 1 }
                }
            },
            { $sort: { numberOfRequests: 1 } }
        ]);

        return Promise.all([
            getStatsPerRoute,
            getRequestsPerDay,
            getRequestsPerHour,
            getTotalRequests
        ]).then(results => {
            return {
                statsPerRoute: results[0],
                requestsPerDay: results[1],
                requestsPerHour: results[2],
                totalRequests: results[3],
            };
        })
    }
};