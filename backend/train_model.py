import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
import joblib

def train_model(data_path='player_performance.csv', model_path='difficulty_model.pkl'):
    df = pd.read_csv(data_path)

    label_encoder = LabelEncoder()
    df['current_difficulty'] = label_encoder.fit_transform(df['current_difficulty'])
    df['next_difficulty'] = label_encoder.fit_transform(df['next_difficulty'])

    X = df[['streak', 'current_difficulty']]
    y = df['next_difficulty']

    # Simplify the model by reducing the maximum depth
    model = DecisionTreeClassifier(max_depth=2, random_state=0)
    scores = cross_val_score(model, X, y, cv=5)
    print(f'Cross-validation scores: {scores}')
    print(f'Average cross-validation score: {scores.mean()}')

    model.fit(X, y)

    feature_importances = model.feature_importances_
    feature_names = ['streak', 'current_difficulty']
    feature_importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': feature_importances})
    print(feature_importance_df)

    joblib.dump(model, model_path)
    print(f'Model saved to {model_path}')


if __name__ == "__main__":
    train_model()