import pandas as pd
import numpy as np
import datetime
from statsmodels.tsa.arima.model import ARIMA

class AdmissionForecaster:
    def __init__(self):
        self.model = None
        self.history_dates = []
        self.history_values = []
        self.rmse = 0.0
        self.mae = 0.0
        self._generate_synthetic_history()
        self._train_model()

    def _generate_synthetic_history(self):
        # Generate 60 days of synthetic admission data
        np.random.seed(42)
        base = datetime.datetime.now().date() - datetime.timedelta(days=60)
        
        dates = [base + datetime.timedelta(days=i) for i in range(60)]
        
        # Base trend + weekly seasonality + noise
        values = []
        for i, d in enumerate(dates):
            base_val = 120 + (i * 0.5) # slight upward trend
            # Weekend dip
            if d.weekday() >= 5: 
                base_val -= 20
            # Noise
            base_val += np.random.normal(0, 15)
            values.append(max(50, int(base_val)))
            
        self.history_dates = dates
        self.history_values = values

    def _train_model(self):
        # Train ARIMA model
        history_series = pd.Series(self.history_values)
        
        # Fit ARIMA(7,1,0) - accounting for weekly seasonality
        self.model = ARIMA(history_series, order=(7,1,0)).fit()
        
        # Calculate mock metrics on training data
        predictions = self.model.predict(start=1, end=len(history_series)-1)
        actuals = history_series[1:]
        
        errors = predictions - actuals
        self.mae = round(float(np.mean(np.abs(errors))), 1)
        self.rmse = round(float(np.sqrt(np.mean(errors**2))), 1)

    def forecast(self, days=7):
        """Returns 7-day forecast with confidence intervals."""
        forecast = self.model.get_forecast(steps=days)
        mean_forecast = forecast.predicted_mean.values
        conf_int = forecast.conf_int(alpha=0.05).values # 95% CI
        
        today = datetime.datetime.now().date()
        result = []
        
        # Add last 3 days of historical for chart context
        for i in range(3, 0, -1):
            past_date = today - datetime.timedelta(days=i)
            result.append({
                "date": past_date.strftime("%a"),
                "actual": self.history_values[-i],
                "predicted": None,
                "lower": None,
                "upper": None
            })
            
        # Add today and future
        for i in range(days):
            future_date = today + datetime.timedelta(days=i)
            pred = int(mean_forecast[i])
            lower = int(conf_int[i][0])
            upper = int(conf_int[i][1])
            
            result.append({
                "date": future_date.strftime("%a"),
                "actual": self.history_values[-1] if i == 0 else None, # Mock actual for today
                "predicted": pred,
                "lower": max(0, lower),
                "upper": upper
            })
            
        return result
        
forecaster_instance = AdmissionForecaster()
