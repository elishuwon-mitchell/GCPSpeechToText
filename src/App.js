import React, { Component } from 'react';
import './App.css';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent'
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import CardActions from '@material-ui/core/CardActions';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import socketIOClient from "socket.io-client";
import axios from 'axios';

export default class App extends Component {
	constructor(props) {
		super(props);


		this.state = {
			inProgress: false,
			response: undefined,
			endpoint: "http://localhost:3000",
			previousTranslations: ['test']
		}

		this.handleRecordInput = this.handleRecordInput.bind(this);
		this.handleClear = this.handleClear.bind(this);
	}

	componentDidMount() {
		const { endpoint } = this.state;
		const socket = socketIOClient(endpoint);
		socket.on("messageRecieved", data => {
			console.log("data: ", data);
			this.setState({
				response: data,
				inProgress: false
			});
		});
	}

	handleRecordInput = async () => {
		await this.setState({ inProgress: true });
		axios.post(`${this.state.endpoint}/run`).then((res) => {
			console.log("uploading to pubsub success?:", res);
		});
	}

	handleClear = () => {
		this.setState((prevState, props) => {
			const x = Object.assign([], prevState.previousTranslations);
			x.unshift(prevState.response);
			return {
				response: undefined,
				inProgress: false,
				previousTranslations: x
			}
		});
	}

	render() {
		return (
			<div>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="headline" component="h1">
							Speech to Text using Google Speech API
						</Typography>
					</Toolbar>
				</AppBar>
				<Card className="cardContainer">
					<CardContent>
						{
							this.state.inProgress ?
								<CircularProgress className="progress" thickness={7} />
								:
								<Typography variant="headline">
									{this.state.response ? `You said: ${this.state.response}` : ''}
								</Typography>
						}
					</CardContent>
					<Divider />
					<CardActions className="cardActions">
						<Button onClick={this.handleRecordInput} color="primary">
							Record Input
						</Button>
						<Button onClick={this.handleClear} color="secondary">
							Clear
						</Button>
					</CardActions>
				</Card>
				<Paper className="tableContainer">
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Previous Translations</TableCell>								
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.previousTranslations.map(text => (
								<TableRow key={text.length * new Date().getSeconds()}>
									<TableCell align="right">{text}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Paper>
			</div>
		)
	}
}
