export const findMaxNestingLevel = (groups: any[], currentLevel = 1) => {
  let maxLevel = currentLevel;

  groups.forEach((group) => {
    if (group.groups && group.groups.length > 0) {
      const nestedLevel = findMaxNestingLevel(group.groups, currentLevel + 1);
      maxLevel = Math.max(maxLevel, nestedLevel);
    }
  });

  return maxLevel;
};

export const calculateTotalBalance = (group: any): number => {
  const dataTotal = group.data
    ? group.data.reduce(
        (acc: number, curr: any) => acc + (curr.balance || 0),
        0
      )
    : 0;

  const groupsTotal = group.groups
    ? group.groups.reduce(
        (acc: number, curr: any) => acc + calculateTotalBalance(curr),
        0
      )
    : 0;

  return dataTotal + groupsTotal;
};

export const sortGroupData = (data) => {
  return data.sort((row1, row2) => {
    if (row1.seq !== row2.seq) {
      return row1.seq - row2.seq; // Sort by seq first
    }
    return row1?.accno?.localeCompare(row2?.accno); // If seq is same, sort by accno
  });
};
