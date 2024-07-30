import React from 'react'
import { Spin } from 'antd'
/**
 * Basic Button
 */

type AppProps = {
  onClick?: any,
  children: any,
  className?: string;
  style?: object;
  loading?: boolean;
  disabled?: boolean;
}


export default function BasicButton(props: AppProps) {
  return (
    <button onClick={!props.loading && !props.disabled && props.onClick || (() => { })}
      className={[
        'basic-button',
        props.loading && 'loading',
        props.disabled && 'disabled',
        props.className || ''].join(' ')
      }
      style={props.style || null}
    >
      {props.loading ?
        <><Spin /><span style={{ marginLeft: '10px' }}>{props.children}</span></>
        : <><span>{props.children}</span></>}

      <style lang="scss">{`
            .basic-button{
              width: 254px;
              height: 54px;
              border-radius: 8px;
              border: none;
              background-color: #FFB852;
              color: #ffffff;
              text-align: center;
              line-height: 54px;
              cursor: pointer;
            }
            .basic-button:hover {
              background-color: #3eeb7a;
              filter: brightness(1.05);
            }
            .basic-button.loading {
              cursor: not-allowed;
            }
            .basic-button.disabled {
              cursor: not-allowed;
              background-color: #66666;
            }
            .basic-button.disabled:hover {
              background-color: #666666;
              filter: brightness(1.05);
            }
        `}</style>
    </button>
  )
}