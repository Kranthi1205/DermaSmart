import { API_BASE_URL } from '../config';
export async function validateFace(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API_BASE_URL}/validate-face`, { method: 'POST', body: fd });
    if (!res.ok)
        throw new Error('Network error');
    return res.json();
}
export async function analyzeSkin(input) {
    const fd = new FormData();
    fd.append('image', input.image);
    fd.append('name', input.name || 'User');
    fd.append('skin_type', input.skinType);
    fd.append('age', String(input.age ?? 25));
    fd.append('email', input.email || `user_${Date.now()}@dermasmart.app`);
    const res = await fetch(`${API_BASE_URL}/userInfo`, { method: 'POST', body: fd });
    if (!res.ok)
        throw new Error('Network error');
    const data = await res.json();
    if (data.status === 'error')
        throw new Error(data.message || 'Analysis error');
    return data;
}
export async function submitFeedback(analysisId, isAccurate, comments = '') {
    const res = await fetch(`${API_BASE_URL}/api/analyses/${analysisId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_accurate: isAccurate, comments })
    });
    if (!res.ok)
        throw new Error('Network error');
    const data = await res.json();
    if (data.status === 'error')
        throw new Error(data.message || 'Feedback error');
}
