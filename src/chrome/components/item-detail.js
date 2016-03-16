import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class ItemDetail extends React.Component {
  render() {
    const arrowMargin = 140 + 316 * this.props.arrowOffset;

    return (
      <div className='detail-view-container'>
        <div className='detail-arrow' style={{marginLeft: arrowMargin}}></div>
        <ReactCSSTransitionGroup transitionName='slidedown'
                                 transitionAppear={true}
                                 transitionAppearTimeout={300}
                                 transitionEnterTimeout={300}
                                 transitionLeaveTimeout={300}
                                 >
          <div className='detail-view'>Hello World</div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
