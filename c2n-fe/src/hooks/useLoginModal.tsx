import { useEffect, useState, useMemo } from 'react';
import { Modal, Input, message, Form, Row, Col, Spin, Select } from 'antd';
import { CheckCircleFilled, KeyOutlined, MailOutlined, UserOutlined, } from '@ant-design/icons';

import axios from '@src/api/axios'
import { useAppSelector } from "@src/redux/hooks";
import BasicButton from '@src/components/elements/Button.Basic';
import styles from '@src/containers/LoginModal/LoginModal.module.scss';
import countries from '@src/util/country-by-abbreviation.json';

import {
  TELEGRAM_BOT_ID
} from '@src/config';

import { IconRegisterEmail, IconRegisterTelegram, IconRegisterTwitter } from '@src/components/icons'
import { Follow, Tweet } from 'react-twitter-widgets'

declare global {
  interface Window {
    showLoginModal,
    setLoginState
  }
}

export const useLogin = ({ pId = 0 }) => {
  let walletAddress = useAppSelector(state => state && state.contract.walletAddress);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUserRegister, setIsUserRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginCode, setLoginCode] = useState<string>('');
  const [twitterName, setTwitterName] = useState<string>('');
  const [retweetLink, setRetweetLink] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  // login states: 0-email 1-ins 2-success
  const [loginState, setLoginState] = useState<number>(0);
  const [loginConfig, setLoginConfig] = useState<{ tweetId?, tgGroupLink?, projectName?}>(null);
  type RegisterData = {
    loginEmail: boolean;
    isRegister: boolean;
    tgId?: boolean;
    tgName?: boolean;
    userAddress?: boolean;
    twitterName?: boolean;
    retweetLink?: boolean;
  }
  const [registerData, setRegisterData] = useState<RegisterData>(null)
  const [userAddress, setUserAddress] = useState<string>('');
  const [showAddressHelp, setShowAddressHelp] = useState<boolean>(false);
  const [timer, setTimer] = useState<any>(null);
  const retweetTargetLink = useMemo(() => {
    const tweetId = loginConfig?.tweetId || '';
    return `https://twitter.com/intent/retweet?tweet_id=${tweetId}&related=twitterapi,twittermedia,twitter,support&original_referer=https://bobabrewery.com`;
  }, [loginConfig]);


  const delayExecute = (fn, ...arg) => {
    clearTimeout(timer);
    setTimer(setTimeout(() => fn(...arg), 1000));
  }

  const showLoginModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEmailChange = (event) => {
    setLoginEmail(event.target.value);
  }

  const handleEmailBlur = (event) => {
    handleEmailChange(event);
  }

  const emailValid = useMemo(() => {
    return (/^([a-zA-Z0-9_-]\.?)+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(loginEmail));
  }, [loginEmail])

  const handleCodeChange = (event) => {
    setLoginCode(event.target.value);
  }

  const handleCodeBlur = (event) => {
    handleCodeChange(event);
  }

  const codeValid = useMemo(() => {
    return /^\d{6}$/.test(loginCode);
  }, [loginCode])

  const handleTwitterNameChange = (event) => {
    setTwitterName(event.target.value);
  }

  const handleRetweetLinkChange = (event) => {
    setRetweetLink(event.target.value);
  }

  const retweetLinkValid = useMemo(() => {
    return /\w/.test(retweetLink);
  }, [retweetLink])

  const okButtonStyle = {
    backgroundImage: 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)',
    borderRadius: '10px',
    width: '212px',
    height: '54px',
    color: '#ffffff',
  }

  function clearCookie() {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {
      for (var i = keys.length; i--;) {
        document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString();
      }
    }
  }

  const handleTelegramButtonClick = () => {
    setConfirmLoading(true);
    const telegramFailCb = (error?) => {
      message.error(error || 'Telegram verify fail, please try again.')
      setConfirmLoading(false);
      return;
    }
    const telegramCallback = (data) => {
      if (!data) {
        // authorization failed
        telegramFailCb();
        return;
      }
      const user: any = data.user || data;

      // Here you would want to validate data like described there https://core.telegram.org/widgets/login#checking-authorization
      const f = new FormData();
      f.append('accountId', walletAddress);
      f.append('tgId', user.id);
      f.append('tgName', user.username);
      axios.post('/boba/user/tg_register', f)
        .then((res: any) => {
          if (res.code == 200) {
            setLoginState(6);
            setConfirmLoading(false);
          } else {
            throw new Error(res);
          }
        })
        .catch((e) => {
          telegramFailCb();
          return;
        });
    }

    try {
      window.Telegram.Login.auth(
        { bot_id: TELEGRAM_BOT_ID, request_access: true },
        telegramCallback,
      );
    } catch (e) {
      message.error(e && e.message || 'Telegram verify fail, please try again.')
      setConfirmLoading(false);
    }
  }

  const handleTgGroupButtonClick = () => {
    clearCookie();
    if (registerData && registerData.retweetLink) {
      setLoginState(5);
      return;
    }
    if (registerData && registerData.userAddress) {
      setLoginState(4);
      return;
    }
    setLoginState(3);
    return;
  }

  /**
   * Mail input
   */
  const state0 = (<>
    <Row align="middle" justify="center">
      <IconRegisterEmail width={240} height={129} />
    </Row>
    <Row align="middle" justify="center">
      <div className={styles['text']}>
        We will send you an email with verification code, your email address will be an important identification for your asset on C2N.
      </div>
    </Row>
    <Row align="middle">
      <Col span={24}>
        <Form.Item
          validateStatus={!!loginEmail ? emailValid ? 'success' : 'error' : ''}
          help={!!loginEmail ? emailValid ? ' ' : 'Invalid Email' : ' '}
        >
          <Input
            prefix={<MailOutlined />}
            value={loginEmail}
            onChange={handleEmailChange}
            onInput={(ev) => delayExecute(handleEmailChange, ev)}
            onBlur={handleEmailBlur}
            placeholder={'Fill in your email'}
            className={styles['email-input']}
            disabled={confirmLoading}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row justify="end">
      <BasicButton
        style={{
          width: '100%',
          height: '54px',
          marginTop: '20px',
          backgroundImage: emailValid ? 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)' : '',
          fontSize: '22px'
        }}
        disabled={!emailValid}
        loading={confirmLoading}
        onClick={() => { sendEmailCode() }}>
        Next
      </BasicButton>
    </Row>
  </>);

  /**
   * Code input
   */
  const state1 = (<>
    <Row align="middle" justify="center">
      <IconRegisterEmail width={240} height={129} />
    </Row>
    <Row align="middle" justify="center">
      <div className={styles['text']}>
        We have sent you an email with verification code, please check it and confirm your email address to complete your application.
      </div>
    </Row>
    <Row align="middle">
      <Col span={24}>
        <Input
          prefix={<MailOutlined />}
          value={loginEmail}
          placeholder={'Fill in your email'}
          className={styles['email-input']}
          disabled={true}
        />
      </Col>
    </Row>
    <Row align="middle">
      <Col span={24}>
        <Form.Item
          validateStatus={!!loginCode ? codeValid ? 'success' : 'error' : ''}
          help={!!loginCode ? codeValid ? ' ' : 'Invalid code' : ' '}
        >
          <Input
            prefix={<KeyOutlined />}
            value={loginCode}
            onChange={handleCodeChange}
            onBlur={handleCodeBlur}
            onInput={(ev) => delayExecute(handleCodeChange, ev)}
            placeholder={'Fill in your verification code'}
            className={styles['code-input']}
            disabled={confirmLoading}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row justify="end" gutter={16}>
      <Col span={12}>
        <BasicButton
          style={{
            width: '100%',
            height: '54px',
            marginTop: '20px',
            fontSize: '22px',
            backgroundColor: '#666666',
          }}
          onClick={() => { setLoginState(loginState - 1) }}>
          Prev
        </BasicButton>
      </Col>
      <Col span={12}>
        <BasicButton
          style={{
            width: '100%',
            height: '54px',
            marginTop: '20px',
            backgroundImage: 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)',
            fontSize: '22px'
          }}
          disabled={!emailValid || !codeValid}
          loading={confirmLoading}
          onClick={() => { verifyEmailCode() }}>
          Next
        </BasicButton>
      </Col>
    </Row>
  </>)

  const state2 = (<>
    <Row justify="center">
      <IconRegisterTelegram width={96} height={96}></IconRegisterTelegram>
    </Row>
    <Row justify="center">
      <div className={styles['text']}>
        We need to verify your telegram and notify you on Telegram about status of your registration,
        which is still important to reach your telegram account for customer service and future communication.
      </div>
    </Row>
    <Row justify="center">
      <Col span={24}>
        <BasicButton
          style={{
            width: '100%',
            height: '54px',
            backgroundImage: 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)',
            fontSize: '22px'
          }}
          loading={confirmLoading}
          onClick={handleTelegramButtonClick}>
          {confirmLoading ? 'Please Wait...' : 'Verify your Telegram'}
        </BasicButton>
      </Col>
    </Row>
  </>)

  const state5 = (<>
    <Row justify="center">
      <i className={styles['success-image']}>
      </i>
    </Row>
    <Row justify="center">
      <div style={{ fontSize: '22px' }}>
        Registration Completed
      </div>
    </Row>
    <Row justify="center">
      <p style={{ fontSize: '18px', color: '#505050', textAlign: 'center' }}>
        Congratulations! You have successfully registered.
      </p>
    </Row>
  </>)

  const state3 = (<>
    <Row align="middle" style={{ marginTop: '20px' }}>
      <Col span={24}>
        <Form.Item
        >
          <Select
            size="large"
            showSearch
            placeholder="Please select your country/region"
            filterOption={(input, option) => {
              return option.children.join('').toLowerCase().indexOf(input.toLowerCase()) >= 0
            }}
            onChange={(value, option) => {
              setUserAddress(value);
            }}
          >
            {
              countries.map((item, index) => {
                return <Select.Option value={item.country} key={index}>
                  ({item.abbreviation}) {item.country}
                </Select.Option>
              })
            }
          </Select>
        </Form.Item>
      </Col>
    </Row>
    <Row justify="end">
      <BasicButton
        style={{
          width: '100%',
          height: '54px',
          marginTop: '0px',
          backgroundImage: !!userAddress ? 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)' : '',
          fontSize: '22px'
        }}
        disabled={!userAddress}
        loading={confirmLoading}
        onClick={() => { saveUserAddress() }}>
        {confirmLoading ? 'Please Wait...' : 'Next'}
      </BasicButton>
    </Row>
  </>);

  const state4 = (<>
    <Row justify="center">
      <IconRegisterTwitter width={96} height={96}></IconRegisterTwitter>
    </Row>
    <Row justify="center">
      {/* <div className={styles['text']}>
        C2N official Twitter provides the newest updates about our platform and general crypto world.
        Please click "Follow" to follow us on Twitter, and click "Retweet" to retweet the campaign details,
        kindly copy our Retweet Link down below to make sure you finish this step.
      </div> */}
    </Row>
    <Row justify="center">
      <Col span={24}>
        <Row justify="space-between">
          <Follow username="boba_brewery" options={{ size: "large" }} ></Follow>
          <div className={styles['media-button']}
            onClick={() => { window.open(retweetTargetLink) }}
          >
            Retweet
          </div>
        </Row>
      </Col>
      <Col span={24}>
        <Form.Item
          validateStatus={!!retweetLink ? retweetLinkValid ? 'success' : 'error' : ''}
          help={!!retweetLink ? retweetLinkValid ? ' ' : 'Invalid link' : ' '}
        >
          <Input
            prefix={'Twitter Name'}
            value={twitterName}
            onChange={handleTwitterNameChange}
            onInput={(ev) => delayExecute(handleTwitterNameChange, ev)}
            placeholder={''}
            className={styles['code-input']}
            disabled={confirmLoading}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          validateStatus={!!retweetLink ? retweetLinkValid ? 'success' : 'error' : ''}
          help={!!retweetLink ? retweetLinkValid ? ' ' : 'Invalid link' : ' '}
        >
          <Input
            prefix={'Retweet Link'}
            value={retweetLink}
            onChange={(ev) => setRetweetLink(ev.target.value)}
            onInput={(ev) => delayExecute(handleRetweetLinkChange, ev)}
            placeholder={''}
            className={styles['code-input']}
            disabled={confirmLoading}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <BasicButton
          style={{
            width: '100%',
            height: '54px',
            marginTop: '0px',
            backgroundImage: !!retweetLinkValid ? 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)' : '',
            fontSize: '22px'
          }}
          disabled={!retweetLinkValid}
          loading={confirmLoading}
          onClick={() => { saveUserTwitter() }}>
          {confirmLoading ? 'Please Wait...' : 'Next'}
        </BasicButton>
      </Col>
    </Row>
  </>);

  const state6 = (<>
    <Row justify="center">
      <IconRegisterTelegram width={96} height={96}></IconRegisterTelegram>
      {/* <CheckCircleFilled style={{fontSize:'72px', color:'rgb(30, 161, 82)'}}></CheckCircleFilled> */}
    </Row>
    <Row justify="center">
      <div className={styles['text']}>
        {/* We have verified your Telegram account!  */}
        Join <b>C2N</b> Telegram community and <b>{loginConfig?.projectName}</b> Telegram community to get the newest updates about the ongoing campaign!
      </div>
    </Row>
    <Row style={{ marginBottom: '20px', marginLeft: '0' }} gutter={[16, 16]}>
      <div className={styles['media-button']}
        onClick={() => { window.open('https://t.me/+6jNxyl-l96FhNDM5') }}
      >
        C2N Community
      </div>
      {
        loginConfig?.tgGroupLink
          ? <div className={styles['media-button']}
            onClick={() => { window.open(loginConfig.tgGroupLink) }}
          >
            {loginConfig.projectName} Community
          </div>
          : <></>
      }
    </Row>
    <Row justify="center">
      <Col span={24}>
        <BasicButton
          style={{
            width: '100%',
            height: '54px',
            backgroundImage: 'linear-gradient(179deg, #4DCC8A 0%, #1EA152 100%)',
            fontSize: '22px'
          }}
          loading={confirmLoading}
          onClick={handleTgGroupButtonClick}>
          {confirmLoading ? 'Please Wait...' : 'Next'}
        </BasicButton>
      </Col>
    </Row>
  </>)


  function getRegisterStatus() {
    if (!walletAddress) {
      return;
    }
    setDataLoading(true);
    axios.get('/boba/user/is_register', {
      params: {
        accountId: walletAddress,
        pid: pId,
      }
    })
      .then((res) => {
        const data = res && res.data;
        if (data) {
          // setIsUserRegister(data.loginEmail && data.tgId && data.userAddress && data.retweetLink);
          console.log('🐷',data);
          setIsUserRegister(data.loginEmail && data.userAddress && data.retweetLink);
          setRegisterData(data);
        }
      })
      .catch(e => e)
      .finally(() => {
        setDataLoading(false);
      })
  }

  function sendEmailCode() {
    setConfirmLoading(true);

    let f = new FormData();
    f.append('accountId', walletAddress);
    f.append('loginEmail', loginEmail);

    return axios.get('/boba/user/code', {
      params: {
        loginEmail: encodeURI(loginEmail),
      }
    })
      .then((res: any) => {
        if (res.code == 200) {
          message.success('A verify code has sent to your email, please check out your mail box.')
          setConfirmLoading(false);
          setLoginState(1);
        } else {
          throw new Error(res);
        }
      })
      .catch((e) => {
        message.error(e?.message || 'Network error, please try again.')
        setConfirmLoading(false);
      })
  }

  function verifyEmailCode() {
    setConfirmLoading(true)
    let f = new FormData();
    f.append('accountId', walletAddress);
    f.append('loginEmail', loginEmail);
    f.append('code', loginCode);
    return axios.post('/boba/user/register', f)
      .then((res) => {
        if (res.data) {
          message.success('Verify email success!');
          // setLoginState(2);
          setLoginState(6);
        }
      })
      .catch(e => {
        message.error('Verification failed, please check your email and try again.');
      })
      .finally(() => {
        setConfirmLoading(false);
      })
  }

  function saveUserAddress() {
    setConfirmLoading(true)
    let f = new FormData();
    f.append('accountId', walletAddress);
    f.append('userAddress', userAddress);
    // f.append('code', loginCode);
    return axios.post('/boba/user/address/add', f)
      .then((res) => {
        // message.success('Congratulations! You have successfully registered.')
        // setIsUserRegister(true);
        setLoginState(4);
      })
      .catch(e => {
        message.error('Verification failed, please try again.');
      })
      .finally(() => {
        setConfirmLoading(false);
      })
  }

  function saveUserTwitter() {
    setConfirmLoading(true)
    let f = new FormData();
    f.append('accountId', walletAddress);
    f.append('twitterName', twitterName);
    f.append('retweetLink', retweetLink);
    f.append('pid', pId + '');
    // f.append('code', loginCode);
    return axios.post('/boba/user/twitter/task', f)
      .then((res) => {
        // message.success('Congratulations! You have successfully registered.')
        setIsUserRegister(true);
        setLoginState(5);
      })
      .catch(e => {
        message.error('Verification failed, please try again.');
      })
      .finally(() => {
        setConfirmLoading(false);
      })
  }


  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showLoginModal = showLoginModal;
      window.setLoginState = setLoginState;
    }
  }, []);

  useEffect(() => {
    getRegisterStatus()
  }, [walletAddress]);

  useEffect(() => {
    if (isModalVisible == true) {
      getRegisterStatus();
    }
    setLoginEmail('');
    setConfirmLoading(false);
  }, [isModalVisible])

  useEffect(() => {
    if (registerData && !registerData.loginEmail) {
      setLoginState(0);
      return;
    }
    // if(registerData && !registerData.tgId) {
    //   setLoginState(2);
    //   return;
    // }
    if (registerData && !registerData.userAddress) {
      setLoginState(3);
      return;
    }
    if (registerData && !registerData.retweetLink) {
      // start from 6
      setLoginState(6);
      return;
    }
  }, [registerData]);


  const title = (
    <div className="title" style={{
      textAlign: 'center',
      fontSize: '22px',
      height: '60px',
      lineHeight: '60px'
    }}>
      {loginState == 0 ? 'Verify your email'
        : loginState == 1 ? 'Verify your email'
          : loginState == 2 ? 'Verify your Telegram'
            : loginState == 3 ? 'Verify your country/region'
              : loginState == 4 ? 'Follow our Twitter'
                : loginState == 5 ? 'Register Success'
                  : loginState == 6 ? 'Verify your Telegram'
                    : ''}
    </div>
  )

  const LoginModal = (
    <Modal
      title={null}
      visible={isModalVisible}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      footer={null}
    >
      {dataLoading ? <Spin />
        : <>
          {title}
          <div style={{ maxHeight: 'auto', overflow: 'hidden' }}>
            {
              loginState == 0 ? state0
                : loginState == 1 ? state1
                  : loginState == 2 ? state2
                    : loginState == 3 ? state3
                      : loginState == 4 ? state4
                        : loginState == 5 ? state5
                          : loginState == 6 ? state6
                            : ''
            }
          </div>
        </>}
    </Modal>
  )


  return {
    LoginModal,
    showLoginModal,
    isUserRegister: true,
    setLoginEmail,
    setLoginConfig,
    setLoginState,
  }
}