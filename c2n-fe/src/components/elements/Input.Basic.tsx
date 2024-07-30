import React, { useState } from 'react'
/**
 * Basic Button
 */

type AppProps = {
  type?: string,
  onChange?: any,
  placeholder?: string,
  value?: any,
  pattern?: any,
}

export default class BasicButton extends React.Component<AppProps>{
  render() {
    return (
      <input
        type={this.props.type || 'text'}
        onChange={this.props.onChange}
        value={this.props.value}
        placeholder={this.props.placeholder}
      >
      </input>
    )
  }
}