import pandas as pd
import numpy as np

def generate_synthetic_data(file_path='player_performance.csv', num_samples=1000):
    np.random.seed(0)
    data = {
        'streak': np.random.randint(-5, 10, num_samples),
        'current_difficulty': np.random.choice(['easy', 'normal', 'hard'], num_samples)
    }

    difficulty_mapping = {'easy': 0, 'normal': 1, 'hard': 2}
    data['current_difficulty'] = np.vectorize(difficulty_mapping.get)(data['current_difficulty'])

    conditions = [
        (data['current_difficulty'] == 0) & (data['streak'] >= 3),  # Easy to Normal
        (data['current_difficulty'] == 1) & (data['streak'] >= 3),  # Normal to Hard
        (data['current_difficulty'] == 1) & (data['streak'] <= -2), # Normal to Easy
        (data['current_difficulty'] == 2) & (data['streak'] <= -2), # Hard to Normal
        (data['current_difficulty'] == 0) & (data['streak'] < 3),   # Easy remains Easy
        (data['current_difficulty'] == 1) & (data['streak'] < 3) & (data['streak'] > -2), # Normal remains Normal
        (data['current_difficulty'] == 2) & (data['streak'] > -2)   # Hard remains Hard
    ]
    choices = [1, 2, 0, 1, 0, 1, 2]
    data['next_difficulty'] = np.select(conditions, choices, default=data['current_difficulty'])

    noise = np.random.choice([0, 1, -1], num_samples, p=[0.8, 0.1, 0.1])
    data['next_difficulty'] = np.clip(data['next_difficulty'] + noise, 0, 2)

    df = pd.DataFrame(data)
    easy_samples = df[df['next_difficulty'] == 0]
    normal_samples = df[df['next_difficulty'] == 1]
    hard_samples = df[df['next_difficulty'] == 2]

    min_samples = min(len(easy_samples), len(normal_samples), len(hard_samples))

    balanced_df = pd.concat([
        easy_samples.sample(min_samples, replace=True),
        normal_samples.sample(min_samples, replace=True),
        hard_samples.sample(min_samples, replace=True)
    ])

    # Explicitly add more samples where hard -> normal
    additional_samples = pd.DataFrame({
        'streak': np.random.randint(-5, 0, 200),  # Increase the number of samples
        'current_difficulty': [2] * 200,
        'next_difficulty': [1] * 200
    })
    balanced_df = pd.concat([balanced_df, additional_samples])

    balanced_df.to_csv(file_path, index=False)
    print(f'Synthetic data generated and saved to {file_path}')
    print(balanced_df['next_difficulty'].value_counts())

if __name__ == "__main__":
    generate_synthetic_data()