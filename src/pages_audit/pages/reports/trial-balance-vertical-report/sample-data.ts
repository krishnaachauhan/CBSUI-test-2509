export const columns = [
  { accessor: "acno", columnName: "Ac. no." },
  { accessor: "head", columnName: "Head" },
  { accessor: "balance", columnName: "Balance Amt." },
];

export const groups = [
  {
    groupName: "Group 1",
    data: [
      { accno: "0001", head: "Data 1", balance: 100, noofac: 10 },
      { accno: "0002", head: "Data 2", balance: 200, noofac: 511 },
    ],
  },
  {
    groupName: "Group 2",
    groups: [
      {
        groupName: "Nested Group 1",
        data: [
          { accno: "0003", head: "Data 1", balance: 50 },
          { accno: "0004", head: "Data 2", balance: 60, noofac: 1000 },
          { accno: "0005", head: "Data 3", balance: 25, noofac: 45 },
        ],
      },
      {
        groupName: "Nested Group 2",
        // data: [{ accno: "0006", head: "Data 1", balance: 80, noofac: 53 }],
        groups: [
          {
            groupName: "Nested G2G1",
            data: [{ accno: "0006", head: "Data 1", balance: 80, noofac: 53 }],
          },
        ],
      },
    ],
  },
  {
    groupName: "Group 3",
    groups: [
      {
        groupName: "Nested G3G1",
        data: [
          { accno: "0007", head: "Data 1", balance: 200, noofac: 80 },
          { accno: "0008", head: "Data 2", balance: 300, noofac: 67 },
        ],
      },
      {
        groupName: "Nested G3G2",
        data: [
          { accno: "0007", head: "Data 1", balance: 200, noofac: 640 },
          { accno: "0008", head: "Data 2", balance: 300 },
        ],
      },
    ],
  },
];

// export const groups = [
//   {
//     groupName: "Group 1",
//     data: [
//       { accno: "0001", head: "Data 1", balance: 100 },
//       { accno: "0002", head: "Data 2", balance: 200 },
//       { accno: "0003", head: "Data 3", balance: 150 },
//       { accno: "0004", head: "Data 4", balance: 250 },
//     ],
//   },
//   {
//     groupName: "Group 2",
//     groups: [
//       {
//         groupName: "Nested Group 1",
//         data: [
//           { accno: "0005", head: "Data 1", balance: 50 },
//           { accno: "0006", head: "Data 2", balance: 60 },
//           { accno: "0007", head: "Data 3", balance: 25 },
//           { accno: "0008", head: "Data 4", balance: 90 },
//         ],
//       },
//       {
//         groupName: "Nested Group 2",
//         groups: [
//           {
//             groupName: "Nested G2G1",
//             data: [
//               { accno: "0009", head: "Data 1", balance: 80 },
//               { accno: "0010", head: "Data 2", balance: 110 },
//             ],
//           },
//           {
//             groupName: "Nested G2G2",
//             data: [
//               { accno: "0011", head: "Data 1", balance: 130 },
//               { accno: "0012", head: "Data 2", balance: 140 },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     groupName: "Group 3",
//     groups: [
//       {
//         groupName: "Nested G3G1",
//         data: [
//           { accno: "0013", head: "Data 1", balance: 200 },
//           { accno: "0014", head: "Data 2", balance: 300 },
//           { accno: "0015", head: "Data 3", balance: 350 },
//         ],
//       },
//       {
//         groupName: "Nested G3G2",
//         data: [
//           { accno: "0016", head: "Data 1", balance: 220 },
//           { accno: "0017", head: "Data 2", balance: 260 },
//           { accno: "0018", head: "Data 3", balance: 320 },
//         ],
//       },
//     ],
//   },
//   {
//     groupName: "Group 4",
//     data: [
//       { accno: "0019", head: "Data 1", balance: 500 },
//       { accno: "0020", head: "Data 2", balance: 650 },
//       { accno: "0021", head: "Data 3", balance: 750 },
//     ],
//   },
//   {
//     groupName: "Group 5",
//     groups: [
//       {
//         groupName: "Nested G5G1",
//         data: [
//           { accno: "0022", head: "Data 1", balance: 900 },
//           { accno: "0023", head: "Data 2", balance: 1000 },
//           { accno: "0024", head: "Data 3", balance: 1100 },
//         ],
//       },
//       {
//         groupName: "Nested G5G2",
//         groups: [
//           {
//             groupName: "Nested G5G2G1",
//             data: [
//               { accno: "0025", head: "Data 1", balance: 1200 },
//               { accno: "0026", head: "Data 2", balance: 1300 },
//             ],
//           },
//           {
//             groupName: "Nested G5G2G2",
//             data: [
//               { accno: "0027", head: "Data 1", balance: 1400 },
//               { accno: "0028", head: "Data 2", balance: 1500 },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     groupName: "Group 6",
//     data: [
//       { accno: "0029", head: "Data 1", balance: 600 },
//       { accno: "0030", head: "Data 2", balance: 800 },
//       { accno: "0031", head: "Data 3", balance: 900 },
//       { accno: "0032", head: "Data 4", balance: 1000 },
//     ],
//   },
// ];

export const sections = [
  {
    sectionName: "LIABILITIES",
    groups,
  },
  {
    sectionName: "ASSETS",
    groups,
  },
];

export const jsondata = {
  columnsLabel: [
    { accno: "Ac. no." },
    { head: "Head" },
    { noofac: "No. of Acc." },
    { balance: "Balance Amt." },
  ],
  sections: [
    // {
    //   sectionName: "LIABILITIES",
    //   groups: [
    //     {
    //       groupName: "Group 1",
    //       data: [
    //         { accno: "0001", head: "Data 1", balance: 100, noofac: 10 },
    //         { accno: "0002", head: "Data 2", balance: 200, noofac: 511 },
    //       ],
    //     },
    //     {
    //       groupName: "Group 2",
    //       groups: [
    //         {
    //           groupName: "Nested Group 1",
    //           data: [
    //             { accno: "0003", head: "Data 1", balance: 50 },
    //             { accno: "0004", head: "Data 2", balance: 60, noofac: 1000 },
    //             { accno: "0005", head: "Data 3", balance: 25, noofac: 45 },
    //           ],
    //         },
    //         {
    //           groupName: "Nested Group 2",
    //           groups: [
    //             {
    //               groupName: "Nested G2G1",
    //               data: [
    //                 { accno: "0006", head: "Data 1", balance: 80, noofac: 53 },
    //               ],
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //     {
    //       groupName: "Group 3",
    //       groups: [
    //         {
    //           groupName: "Nested G3G1",
    //           data: [
    //             { accno: "0007", head: "Data 1", balance: 200, noofac: 80 },
    //             { accno: "0008", head: "Data 2", balance: 300, noofac: 67 },
    //           ],
    //         },
    //         {
    //           groupName: "Nested G3G2",
    //           data: [
    //             { accno: "0007", head: "Data 1", balance: 200, noofac: 640 },
    //             { accno: "0008", head: "Data 2", balance: 300 },
    //           ],
    //         },
    //       ],
    //     },
    //     // more groups for this section
    //   ],
    // },
    // {
    //   sectionName: "ASSETS",
    //   groups: [
    //     {
    //       groupName: "Group 1",
    //       data: [
    //         { accno: "0001", head: "Data 1", balance: 100, noofac: 10 },
    //         { accno: "0002", head: "Data 2", balance: 200, noofac: 511 },
    //       ],
    //     },
    //     {
    //       groupName: "Group 2",
    //       groups: [
    //         {
    //           groupName: "Nested Group 1",
    //           data: [
    //             { accno: "0003", head: "Data 1", balance: 50 },
    //             { accno: "0004", head: "Data 2", balance: 60, noofac: 1000 },
    //             { accno: "0005", head: "Data 3", balance: 25, noofac: 45 },
    //           ],
    //         },
    //         {
    //           groupName: "Nested Group 2",
    //           groups: [
    //             {
    //               groupName: "Nested G2G1",
    //               data: [
    //                 { accno: "0006", head: "Data 1", balance: 80, noofac: 53 },
    //               ],
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //     {
    //       groupName: "Group 3",
    //       groups: [
    //         {
    //           groupName: "Nested G3G1",
    //           data: [
    //             { accno: "0007", head: "Data 1", balance: 200, noofac: 80 },
    //             { accno: "0008", head: "Data 2", balance: 300, noofac: 67 },
    //           ],
    //         },
    //         {
    //           groupName: "Nested G3G2",
    //           data: [
    //             { accno: "0007", head: "Data 1", balance: 200, noofac: 640 },
    //             { accno: "0008", head: "Data 2", balance: 300 },
    //           ],
    //         },
    //       ],
    //     },
    //     // more groups for this section
    //   ],
    // },
    // more sections as above format

    {
      sectionName: "LIABILITIES",
      groups: [
        {
          grp_cd: "2",
          groupName: "RESERVE & OTHER FUNDS.(ANNE-1)",
          data: [
            {
              accno: "000401",
              head: "STATUTORY RESERVE FUND",
              balance: 1474368880.11,
              noofac: 0,
              seq: 1,
            },
            {
              accno: "000402",
              head: "BAD DEBTS RESERVE FUND",
              balance: 275187716.98,
              noofac: 0,
              seq: 2,
            },
            {
              accno: "000403",
              head: "BAD DEBTS RESE. FUND (SPECIAL)",
              balance: 430000000,
              noofac: 0,
              seq: 3,
            },
            {
              accno: "000404",
              head: "DIVIDEND EQUILIZATION FUND",
              balance: 5868922.25,
              noofac: 0,
              seq: 4,
            },
            {
              accno: "000405",
              head: "BUILDING FUND",
              balance: 109776112.17,
              noofac: 0,
              seq: 5,
            },
            {
              accno: "000406",
              head: "INVESTMENT DEPRECIATION RESERV",
              balance: 225474645.41,
              noofac: 0,
              seq: 6,
            },
            {
              accno: "000408",
              head: "CHARITY DONATION FUND",
              balance: 1092286.13,
              noofac: 0,
              seq: 8,
            },
            {
              accno: "000409",
              head: "CO-OP. PROPAGANDA FUND",
              balance: 12459031.89,
              noofac: 0,
              seq: 9,
            },
            {
              accno: "000410",
              head: "JUBILEE FUND",
              balance: 20989764530.62,
              noofac: 0,
              seq: 10,
            },
            {
              accno: "000412",
              head: "BLDG.& FURNI.RENOVATION FUND",
              balance: 50000000,
              noofac: 0,
              seq: 12,
            },
            {
              accno: "000413",
              head: "SHARE HOLDER BENEFIT FUND",
              balance: 2927935.1,
              noofac: 0,
              seq: 13,
            },
            {
              accno: "000414",
              head: "STAFF BENEFIT FUND",
              balance: 4883453.49,
              noofac: 0,
              seq: 14,
            },
            {
              accno: "000416",
              head: "STANDARD ASSETS RESERVE FUND",
              balance: 20257605,
              noofac: 0,
              seq: 16,
            },
            {
              accno: "000417",
              head: "CONTINGENCY FUND",
              balance: 15000000,
              noofac: 0,
              seq: 17,
            },
            {
              accno: "000418",
              head: "UNFORESEEN LOSSES RESERVE",
              balance: 74093857,
              noofac: 0,
              seq: 18,
            },
            {
              accno: "000424",
              head: "INVESTMENT FLUCTUATION RESERVE",
              balance: 124889856.61,
              noofac: 0,
              seq: 24,
            },
            {
              accno: "000421",
              head: "PROVISON FOR EXPOSURE TO MMCB",
              balance: 13364529.95,
              noofac: 0,
              seq: 24,
            },
          ],
        },
      ],
    },
  ],
  // additional data like Report Label, defaultGroupsExpanded, etc
};
