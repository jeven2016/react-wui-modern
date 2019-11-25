import React, {Component} from 'react';

export default class StatsTable extends Component {
  /*  static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            _id: PropTypes.string,
            subscriber: PropTypes.string,
            policyName: PropTypes.string,
            executionTime: PropTypes.string,
            description: PropTypes.string,
            createTimeStamp: PropTypes.string,
            userIp: PropTypes.string
        }))
    };*/

  constructor(args) {
    super(args);

    this.state = {
      show: false,
    };
  }

  componentWillUpdate() {
  }

  render() {
    let data = this.props.data;
    if (!data) {
      data = [];
    }

    return (
        <table className="table">
          <thead>
          <tr>
            <th>Subscriber</th>
            <th>Policy</th>
            <th>Execution Time</th>
            <th>SMS Content</th>
            <th>Timestamp</th>
            <th>Source IP</th>
          </tr>
          </thead>
          <tbody>
          {
            data.map(row => {
              return (
                  <tr key={row._id}>
                    <td>{row.subscriber}</td>
                    <td>{row.policyName}</td>
                    <td>{row.executionTime}</td>
                    <td>{row.description}</td>
                    <td>{row.createTimeStamp}</td>
                    <td>{row.userIp}</td>
                  </tr>
              );
            })
          }
          </tbody>
        </table>
    );
  }
}


