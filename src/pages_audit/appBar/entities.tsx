export const ShowEntities = ({ entities }) => {
  let result: any = null;
  if (Boolean(entities)) {
    return "";
  }
  let allEntities = Object.keys(entities);
  if (Array.isArray(allEntities)) {
    result = allEntities.map((one) => {
      return <Entities entityName={one} entities={entities[one]} />;
    });
  }
  return result;
};

export const Entities = ({ entityName, entities }) => {
  let rows: any = null;
  if (Array.isArray(entities)) {
    rows = entities.map((one, index) => (
      <tr key={index}>
        <td>{one.branchName}</td>
      </tr>
    ));
  }
  return (
    <>
      <br />
      <table>
        <tbody>
          <tr>
            <th>{`${entityName} Assigned`}</th>
          </tr>
          {rows}
        </tbody>
      </table>
    </>
  );
};

export const ShowProducts = ({ products }) => {
  let rows: any = null;
  if (Boolean(products)) {
    return <></>;
  }
  if (Array.isArray(products) && products.length > 0) {
    rows = products.map((one, index) => (
      <tr key={index}>
        <td>{one.categoryName}</td>
      </tr>
    ));

    return (
      <>
        <br />
        <table>
          <tbody>
            <tr>
              <th>Products Assigned</th>
            </tr>
          </tbody>
          {rows}
        </table>
      </>
    );
  } else {
    return null;
  }
};
