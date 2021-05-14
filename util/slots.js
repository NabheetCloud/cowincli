const axios = require("axios");
const Table = require("tty-table");
const chalk = require("chalk");
const notifier = require("node-notifier");
const { config, options } = require("./config");

var inquirer = require("inquirer");

module.exports = function (districtid) {
  var date = new Date();
  var todaysDate = `${date.getDate()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${date.getFullYear()}`;
  inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "Please choose age group",
        choices: [
          {
            name: "All ages",
            value: "",
          },
          {
            name: "45+",
            value: "45",
          },
          {
            name: "18-45",
            value: "18",
          },
        ],
      },
      /* Pass your questions in here */
    ])
    .then((answers) => {
      axios
        .get(
          `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtid}&date=${todaysDate}`,
          config
        )
        .then(function (response) {
          // handle success
          //   console.table(response.data.states);
          let header = [
            {
              value: "center",
              headerColor: "cyan",
              color: "white",
              align: "left",
              alias: "Center Name",
              width: 40,
            },
            {
              value: "address",
              color: "red",
              alias: "Center Address",
              width: 40,
            },
            {
              value: "available",
              color: "red",
              alias: "Available Slot",
              width: 20,
            },
            {
              value: "age",
              color: "red",
              alias: "Age",
              width: 10,
            },
            {
              value: "date",
              color: "red",
              alias: "Date",
              width: 20,
            },
          ];
          //   const out = Table(header,response.data.centers,options).render()
          // console.log(response.data.centers); //prints output
          var finalData = [];
          var districtName;
          response.data.centers.forEach((item) => {
            districtName = item.district_name;
            item.sessions.forEach((session) => {
                if(answers.choice==""){
              let ourData = {
                center: item.name,
                address: item.address,
                available: session.available_capacity,
                age: session.min_age_limit,
                date: session.date,
              };
              finalData.push(ourData);}
              else if(answers.choice==session.min_age_limit){
                let ourData = {
                  center: item.name,
                  address: item.address,
                  available: session.available_capacity,
                  age: session.min_age_limit,
                  date: session.date,
                };
                finalData.push(ourData);}
            });
          });
          const out = Table(header, finalData, options).render();
          console.log(
            chalk.blue.bgGreen.bold(`Date for which run ->${todaysDate}`)
          );
          console.log(chalk.blue.bgGreen.bold(`District ->${districtName}`));
          console.log(out);
          notifier.notify({
              title:"Cowin slots executed",
              subtitle:"subtitle",
              message:"Cowin slots executed",
              wait:true
          })
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
};
