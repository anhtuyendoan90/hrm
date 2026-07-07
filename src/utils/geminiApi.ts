/**
 * geminiApi.ts
 *
 * Client-side integration with Google Gemini API for generating
 * HR analytics reports and interactive chat.
 */

import type { ColumnMapping, KPIData, ChatMessage } from '../context/AppContext';
import { getNumVal, getStrVal, getVal } from '../context/AppContext';

type Row = Record<string, unknown>;

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/* ============================================================
   BUILD DATA SUMMARY FOR PROMPTS
   ============================================================ */

function buildDataSummary(
  kpis: KPIData,
  data: Row[],
  mapping: ColumnMapping
): string {
  const lines: string[] = [];

  lines.push('=== HR DATA SUMMARY ===');
  lines.push(`Total Employees: ${kpis.totalEmployees}`);
  lines.push(`Active Employees: ${kpis.activeEmployees}`);
  lines.push(`Terminated Employees: ${kpis.terminatedEmployees}`);
  lines.push(`Turnover Rate: ${kpis.turnoverRate}%`);
  if (kpis.avgSalary !== null) lines.push(`Average Salary: ${Math.round(kpis.avgSalary).toLocaleString()}`);
  if (kpis.avgAge !== null) lines.push(`Average Age: ${kpis.avgAge.toFixed(1)}`);
  if (kpis.avgTenure !== null) lines.push(`Average Tenure: ${kpis.avgTenure.toFixed(1)} years`);
  if (kpis.avgPerformance !== null) lines.push(`Average Performance Score: ${kpis.avgPerformance.toFixed(2)}`);
  if (kpis.avgEngagement !== null) lines.push(`Average Engagement Score: ${kpis.avgEngagement.toFixed(2)}`);
  if (kpis.avgAbsenceDays !== null) lines.push(`Average Absence Days: ${kpis.avgAbsenceDays.toFixed(1)}`);
  if (kpis.avgPromotion !== null) lines.push(`Average Promotion Count: ${kpis.avgPromotion.toFixed(2)}`);
  if (kpis.avgTrainingHours !== null) lines.push(`Average Training Hours: ${kpis.avgTrainingHours.toFixed(1)}`);

  // Department breakdown
  if (mapping.department) {
    const deptMap = new Map<string, { count: number; salaries: number[]; perfs: number[]; engs: number[] }>();
    for (const row of data) {
      const dept = getStrVal(row, mapping, 'department');
      if (!dept) continue;
      if (!deptMap.has(dept)) deptMap.set(dept, { count: 0, salaries: [], perfs: [], engs: [] });
      const d = deptMap.get(dept)!;
      d.count++;
      const sal = getNumVal(row, mapping, 'salary');
      if (sal !== null) d.salaries.push(sal);
      const perf = getNumVal(row, mapping, 'performance_score');
      if (perf !== null) d.perfs.push(perf);
      const eng = getNumVal(row, mapping, 'engagement_score');
      if (eng !== null) d.engs.push(eng);
    }

    lines.push('\n=== DEPARTMENT BREAKDOWN ===');
    for (const [dept, d] of deptMap) {
      const avgSal = d.salaries.length > 0 ? Math.round(d.salaries.reduce((a, b) => a + b, 0) / d.salaries.length) : 'N/A';
      const avgPerf = d.perfs.length > 0 ? (d.perfs.reduce((a, b) => a + b, 0) / d.perfs.length).toFixed(2) : 'N/A';
      const avgEng = d.engs.length > 0 ? (d.engs.reduce((a, b) => a + b, 0) / d.engs.length).toFixed(2) : 'N/A';
      lines.push(`${dept}: ${d.count} employees, Avg Salary: ${avgSal}, Avg Performance: ${avgPerf}, Avg Engagement: ${avgEng}`);
    }
  }

  // Gender breakdown
  if (mapping.gender) {
    const genderMap = new Map<string, number>();
    for (const row of data) {
      const g = getStrVal(row, mapping, 'gender');
      if (!g) continue;
      genderMap.set(g, (genderMap.get(g) || 0) + 1);
    }
    lines.push('\n=== GENDER BREAKDOWN ===');
    for (const [g, count] of genderMap) {
      lines.push(`${g}: ${count} (${((count / data.length) * 100).toFixed(1)}%)`);
    }
  }

  // Hire year trend
  if (mapping.hire_date) {
    const yearMap = new Map<number, number>();
    for (const row of data) {
      const hd = getVal(row, mapping, 'hire_date');
      if (hd instanceof Date) {
        const y = hd.getFullYear();
        if (y > 1900 && y < 2100) yearMap.set(y, (yearMap.get(y) || 0) + 1);
      }
    }
    if (yearMap.size > 0) {
      lines.push('\n=== HIRING TREND ===');
      const sorted = [...yearMap.entries()].sort((a, b) => a[0] - b[0]);
      for (const [year, count] of sorted) {
        lines.push(`${year}: ${count} hires`);
      }
    }
  }

  // Sample rows (first 5)
  lines.push(`\n=== SAMPLE DATA (first 5 rows, ${data.length} total) ===`);
  const sample = data.slice(0, 5);
  for (const row of sample) {
    const parts: string[] = [];
    for (const [key, val] of Object.entries(row)) {
      if (val instanceof Date) {
        parts.push(`${key}: ${val.toISOString().split('T')[0]}`);
      } else {
        parts.push(`${key}: ${val}`);
      }
    }
    lines.push(parts.join(' | '));
  }

  return lines.join('\n');
}

/* ============================================================
   CALL GEMINI API
   ============================================================ */

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 400) throw new Error('API Key không hợp lệ hoặc request sai định dạng.');
    if (response.status === 403) throw new Error('API Key không có quyền truy cập.');
    if (response.status === 429) throw new Error('Đã vượt quá giới hạn request. Vui lòng thử lại sau.');
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Không nhận được phản hồi từ Gemini.');
  return text;
}

/* ============================================================
   GENERATE REPORT
   ============================================================ */

export async function generateReport(
  apiKey: string,
  kpis: KPIData,
  data: Row[],
  mapping: ColumnMapping
): Promise<string> {
  const summary = buildDataSummary(kpis, data, mapping);

  const prompt = `Bạn là chuyên gia phân tích nhân sự (HR Analytics Expert). Dựa trên dữ liệu HR sau đây, hãy viết một báo cáo phân tích CHI TIẾT bằng tiếng Việt, sử dụng định dạng Markdown.

${summary}

Báo cáo phải bao gồm các phần sau (sử dụng heading Markdown):

# 📊 Báo Cáo Phân Tích Nhân Sự

## 1. Tóm Tắt Tổng Quan Dashboard
- Tổng hợp các KPI chính
- Đánh giá tình hình chung

## 2. Insight Quan Trọng
- Những phát hiện nổi bật nhất
- Điểm mạnh và điểm yếu

## 3. Xu Hướng Nổi Bật
- Xu hướng tuyển dụng
- Xu hướng nghỉ việc
- Xu hướng performance theo thời gian

## 4. Phân Tích Rủi Ro
- Rủi ro nhân sự hiện tại
- Các chỉ số cảnh báo
- Nguy cơ mất nhân tài

## 5. Phòng Ban Cần Chú Ý
- Phòng ban nào có vấn đề?
- So sánh giữa các phòng ban
- Phòng ban hiệu suất thấp/cao

## 6. Phân Tích Salary
- Phân bố lương
- Chênh lệch lương giữa phòng ban
- Đề xuất điều chỉnh lương

## 7. Phân Tích Turnover (Nghỉ Việc)
- Tỷ lệ nghỉ việc
- Nguyên nhân có thể
- Nhóm nhân viên có nguy cơ nghỉ cao

## 8. Phân Tích Engagement
- Mức độ gắn kết trung bình
- Phòng ban có engagement thấp
- Tương quan engagement với performance

## 9. Phân Tích Performance
- Phân bố điểm performance
- Nhân viên xuất sắc vs kém
- Yếu tố ảnh hưởng performance

## 10. Đề Xuất Giữ Chân Nhân Viên
- Chiến lược retention
- Chương trình cụ thể

## 11. Đề Xuất Đào Tạo
- Nhu cầu đào tạo
- Phòng ban/nhóm ưu tiên
- Loại hình đào tạo phù hợp

## 12. Đề Xuất Tuyển Dụng
- Nhu cầu tuyển dụng
- Phòng ban cần bổ sung
- Chiến lược tuyển dụng

---
*Báo cáo được tạo tự động bởi HR Analytics AI*

Hãy viết chi tiết, đưa ra số liệu cụ thể, và đề xuất hành động rõ ràng. Sử dụng emoji phù hợp để báo cáo trực quan hơn.`;

  return callGemini(apiKey, prompt);
}

/* ============================================================
   CHAT WITH GEMINI
   ============================================================ */

export async function chatWithGemini(
  apiKey: string,
  message: string,
  kpis: KPIData,
  data: Row[],
  mapping: ColumnMapping,
  history: ChatMessage[]
): Promise<string> {
  const summary = buildDataSummary(kpis, data, mapping);

  // Build conversation history
  const historyText = history
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
    .join('\n');

  const prompt = `Bạn là trợ lý AI phân tích nhân sự (HR Analytics Assistant). Hãy trả lời câu hỏi của người dùng dựa trên dữ liệu HR hiện tại.

=== DỮ LIỆU HR ===
${summary}

=== LỊCH SỬ HỘI THOẠI ===
${historyText || '(Chưa có)'}

=== CÂU HỎI MỚI ===
User: ${message}

Hãy trả lời bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin. Sử dụng số liệu cụ thể từ dữ liệu. Nếu câu hỏi liên quan đến nhân viên cụ thể, hãy tìm trong dữ liệu. Sử dụng Markdown formatting khi cần.`;

  return callGemini(apiKey, prompt);
}
