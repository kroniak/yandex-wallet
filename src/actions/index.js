import { push } from 'react-router-redux';

import * as action from './types';

import axios from 'axios';

const ROOT_URL = '/api';
// const LOGIN_URL = `${ROOT_URL}/signin`;
// const SIGNUP_URL = `${ROOT_URL}/signup`;

export const signingUser = () => {
    return dispatch => {
        dispatch({
            type: action.USER_LOGIN_SUCCESS
        });
        dispatch(push('/cards'));
    }
};

export const signOutUser = () => {
    return dispatch => {
        dispatch({
            type: action.USER_LOGOUT
        });
        dispatch(push('/'));
    }
};

/**
* Вытаскивает данные по картам пользователя
* 
* @returns 
*/
export const fetchCards = () => {
    return dispatch => {
        axios
            .get(`${ROOT_URL}/cards`, {
                headers: {
                    authorization: 'JWT ' + localStorage.getItem('token')
                }
            })
            .then(result => {
                dispatch({
                    type: action.FETCH_CARDS_SUCCESS,
                    payload: {
                        data: result.data
                    }
                });
                if (result.data[0]) dispatch(fetchTransactions(result.data[0].id));
            })
            .catch(error => {
                dispatch({
                    type: action.FETCH_CARDS_FAILED,
                    payload: {
                        data: [],
                        error
                    }
                });
                dispatch({
                    type: action.FETCH_TRANS_SUCCESS,
                    payload: {
                        data: []
                    }
                });
                console.log(error);
            }
        );
    };
};

/**
* Вытаскивает данные по картам пользователя
* 
* @returns 
*/
export const fetchTransactions = id => {
    return dispatch => {
        axios
            .get(`${ROOT_URL}/cards/${id}/transactions`, {
                headers: {
                    authorization: 'JWT ' + localStorage.getItem('token')
                }
            })
            .then(result => {
                dispatch({
                    type: action.FETCH_TRANS_SUCCESS,
                    payload: {
                        data: result.data,
                        id
                    }
                });
            })
            .catch(error => {
                dispatch({
                    type: action.FETCH_TRANS_FAILED,
                    payload: {
                        data: [],
                        id,
                        error
                    }
                });
                console.log(error);
            }
        );
    };
};
