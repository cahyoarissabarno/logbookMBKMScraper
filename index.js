const axios = require('axios');
const converter = require('json-2-csv')
const fs = require('fs');

require('dotenv').config()

const dateFormat = async(time)=>{
    var dates = new Date(time)
    var year = dates.getFullYear();
    var month = dates.getMonth();
    var date = dates.getDate();
    var day = dates.getDay();

    switch(day) {
        case 0: day = "Minggu"; break;
        case 1: day = "Senin"; break;
        case 2: day = "Selasa"; break;
        case 3: day = "Rabu"; break;
        case 4: day = "Kamis"; break;
        case 5: day = "Jum'at"; break;
        case 6: day = "Sabtu"; break;
    }
    
    switch(month) {
        case 0: month = "Januari"; break;
        case 1: month = "Februari"; break;
        case 2: month = "Maret"; break;
        case 3: month = "April"; break;
        case 4: month = "Mei"; break;
        case 5: month = "Juni"; break;
        case 6: month = "Juli"; break;
        case 7: month = "Agustus"; break;
        case 8: month = "September"; break;
        case 9: month = "Oktober"; break;
        case 10: month = "November"; break;
        case 11: month = "Desember"; break;
    }
    
    return({year, month, date, day})
}

const getReport = async (urlLink, token) => {
    let daily = []
    let weekly = []
    const config = {
        method: 'get',
        url: urlLink,
        headers: { 
          'Authorization': `Bearer ${token}`
        }
    };
    
    await axios(config)
    .then(async (response) => {
        const reports = response.data.data;
        const startDate = await dateFormat(reports.start_date)
        const endDate = await dateFormat(reports.end_date)
        const weeklyReport = {
            "Minggu Ke-": reports.counter,
            "Durasi": `${startDate.date} ${startDate.month} - ${endDate.date} ${endDate.month} ${startDate.year}`,
            "Pelajaran yang didapat": reports.learned_weekly
        }
        weekly.push(weeklyReport)
        // console.log(weeklyReport)
    
        reports.daily_report.map(async(report,i)=>{
            // console.log(reports)
            const date = await dateFormat(report.report_date)
            const dailyReport = {
                "Minggu Ke-": reports.counter,
                "Tanggal": `${date.day}, ${date.date} ${date.month} ${date.year}`,
                "Aktivitas yang dikerjakan": report.report
            }
            daily.push(dailyReport)
            // console.log(dailyReport)
        })
    })
    .catch(function (error) {
    console.log(error);
    });   
    
    return({daily, weekly})
}

const main = async (startWeek, endWeek, token, id) => {
    let allDailyReport = []
    let allWeeklyReport = []
    for (let i = startWeek; i <= endWeek; i++) {
        let url = `https://api.kampusmerdeka.kemdikbud.go.id/studi/report/perweek/${id}/${i}`
        const reports = await getReport(url, token)
        allDailyReport.push(...reports.daily)
        allWeeklyReport.push(...reports.weekly)
    }
    return({allDailyReport, allWeeklyReport})
}

const token = process.env.TOKEN     //barier token akun kampus merdeka
const id = process.env.ID      //id user akun kampus merdeka

const startWeek = 1
const endWeek = 2

main(startWeek, endWeek, token, id).then(async(result) => {
    converter.json2csv(result.allDailyReport, (err, csv) => {
        if (err) { throw err}
        fs.writeFileSync('daily-report.csv', csv)
    })

    converter.json2csv(result.allWeeklyReport, (err, csv) => {
        if (err) { throw err}
        fs.writeFileSync('weekly-report.csv', csv)
    })
}).catch((err) => {
    console.log(err)
});




