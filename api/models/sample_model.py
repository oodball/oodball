import numpy as np
from sklearn.ensemble import RandomForestClassifier

class SampleModel:
    def __init__(self):
        # Initialize a simple model for demonstration
        self.model = RandomForestClassifier(n_estimators=100)
        # Train the model with some dummy data
        self._train_dummy_model()
    
    def _train_dummy_model(self):
        # Create dummy training data
        X = np.random.rand(100, 4)  # 100 samples, 4 features
        y = np.random.randint(0, 2, 100)  # Binary classification
        self.model.fit(X, y)
    
    def predict(self, data):
        """
        Make predictions using the model
        Args:
            data: Input data for prediction
        Returns:
            Prediction result
        """
        try:
            # Convert input data to numpy array
            input_data = np.array(data['features']).reshape(1, -1)
            # Make prediction
            prediction = self.model.predict(input_data)
            return prediction.tolist()
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}") 